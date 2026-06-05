#!/usr/bin/env python3
"""Tiny, dependency-free GitHub deploy webhook for demo.kareem-3del.com.

GitHub pushes a `push` event here (over HTTPS, via Traefik on :443). We verify
the HMAC-SHA256 signature, then pull the latest `frontend/` from the public repo
and rsync it into the bind-mounted document root. This replaces the old
GitHub-Actions SSH push, whose inbound path to port 2222 is intermittently
dropped upstream of the host. The server's *outbound* path to GitHub is
reliable, so a pull-on-push model is robust.

Stdlib only (python:3.x-alpine + git + rsync). See deploy/docker-compose.yml.
"""
import hashlib
import hmac
import json
import os
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ["WEBHOOK_SECRET"].encode()
REPO_DIR = os.environ.get("REPO_DIR", "/repo")
SITE_DIR = os.environ.get("SITE_DIR", "/site")
BRANCH = os.environ.get("BRANCH", "main")
HOOK_PATH = os.environ.get("HOOK_PATH", "/_deploy-hook")
PORT = int(os.environ.get("PORT", "9000"))

_lock = threading.Lock()


def log(*parts):
    print(*parts, flush=True)


def run(cmd, cwd=None):
    log("+", " ".join(cmd))
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.stdout.strip():
        log(r.stdout.strip())
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)} -> {r.returncode}: {r.stderr.strip()}")
    return r.stdout.strip()


def deploy():
    # Coalesce: if a deploy is already running, let it finish — it will pull
    # whatever HEAD is by the time it fetches, so concurrent triggers are moot.
    if not _lock.acquire(blocking=False):
        log("deploy already in progress; skipping concurrent trigger")
        return
    try:
        log("=== deploy start ===")
        run(["git", "fetch", "--filter=blob:none", "origin", BRANCH], cwd=REPO_DIR)
        run(["git", "reset", "--hard", f"origin/{BRANCH}"], cwd=REPO_DIR)
        run(["rsync", "-a", "--delete", "--exclude=.DS_Store",
             f"{REPO_DIR}/frontend/", f"{SITE_DIR}/"])
        head = run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_DIR)
        log(f"=== deploy done @ {head} ===")
    except Exception as exc:  # noqa: BLE001 - log and stay up for the next push
        log("DEPLOY FAILED:", exc)
    finally:
        _lock.release()


class Handler(BaseHTTPRequestHandler):
    def _reply(self, code, msg):
        body = (msg + "\n").encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._reply(200, "ok")

    def do_POST(self):
        if self.path.rstrip("/") != HOOK_PATH.rstrip("/"):
            return self._reply(404, "not found")
        length = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(length) if length else b""
        sig = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            log("rejected: bad or missing signature")
            return self._reply(403, "bad signature")
        event = self.headers.get("X-GitHub-Event", "")
        if event == "ping":
            return self._reply(200, "pong")
        if event != "push":
            return self._reply(200, f"ignored event: {event}")
        try:
            ref = json.loads(body or b"{}").get("ref", "")
        except (ValueError, TypeError):
            ref = ""
        if ref and ref != f"refs/heads/{BRANCH}":
            return self._reply(200, f"ignored ref: {ref}")
        threading.Thread(target=deploy, daemon=True).start()
        return self._reply(202, "deploy triggered")

    def log_message(self, *args):
        pass  # we do our own logging


if __name__ == "__main__":
    log(f"deploy-hook listening on :{PORT} path={HOOK_PATH} "
        f"repo={REPO_DIR} site={SITE_DIR} branch={BRANCH}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
