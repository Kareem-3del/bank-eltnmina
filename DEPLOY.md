# Deploy — demo.kareem-3del.com

Static site (`frontend/`) is served by an `nginx:alpine` container behind the existing Traefik reverse proxy on the `zagel` host. Let's Encrypt issues the cert.

## Auto-deploy (push webhook, pull-on-push)

Deploy is **server-initiated**. A GitHub *push* webhook hits `https://demo.kareem-3del.com/_deploy-hook`; a tiny listener container (`redf-deploy-hook`) verifies the HMAC signature, pulls the latest `frontend/` from this public repo, and rsyncs it into `/opt/redf-demo/site/`. nginx serves the new files immediately (no restart).

**Why not GitHub Actions at all?** This host's provider drops GitHub **hosted-runner** IP ranges (Azure) upstream of the box — on *every* port, not just SSH. A blocked runner times out identically on `2222` (the old `rsync` deploy) and on `443` (a verify `curl`); ~80% of recent runs landed on a blocked runner. The OS firewall accepts the traffic, fail2ban isn't banning, conntrack is healthy, and the runs that *did* land on a non-blocked runner prove the keys/config were fine — the failures are pure connection timeouts that never reach the box.

The decisive part: GitHub's **webhook delivery** does **not** come from Actions runners. It comes from GitHub's own hook IPs (the `hooks` list in `https://api.github.com/meta`, e.g. `140.82.x`), which are **not** in the blocked Azure ranges — so the push webhook is reliable exactly where Actions runners are not. That's why deploy is now pull-on-push and there is **no Actions-based step**: a runner-based verify would show red on ~80% of perfectly good deploys. Verify a deploy from the delivery log + the hook log instead (below).

Source of truth for the server pieces lives in this repo under `deploy/`:

| Path                          | Purpose                                                            |
|-------------------------------|-------------------------------------------------------------------|
| `deploy/docker-compose.yml`   | Both services (`redf-demo` nginx + `redf-deploy-hook`) — mirror of `/opt/redf-demo/docker-compose.yml`. |
| `deploy/hook/hook.py`         | Stdlib-only webhook listener (HMAC verify → `git pull` + `rsync`).|
| `deploy/hook/Dockerfile`      | `python:3-alpine` + `git` + `rsync`.                              |

Server-only (never committed):

| File                       | Purpose                                                                |
|----------------------------|------------------------------------------------------------------------|
| `/opt/redf-demo/hook.env`  | `WEBHOOK_SECRET=…` — the HMAC secret, shared with the GitHub webhook.  |
| `/opt/redf-demo/repo/`     | Sparse, blob-filtered clone of `frontend/` only (incremental fetches). |

The GitHub webhook (id `636588703`, event `push` → the `/_deploy-hook` URL) carries the same secret in its `config.secret`.

Inspect deploys / deliveries:

```sh
ssh kareem 'docker logs --tail 30 redf-deploy-hook'                     # server-side deploy log
gh api repos/Kareem-3del/bank-eltnmina/hooks/636588703/deliveries \
  --jq '.[] | "\(.delivered_at) \(.event) \(.status) \(.status_code)"'  # GitHub delivery log
```

A healthy deploy shows the delivery as `OK`/`202` and the hook log ending in `=== deploy done @ <sha> ===` matching the pushed commit.

Manually trigger a redeploy without pushing (re-send the last delivery):

```sh
last=$(gh api repos/Kareem-3del/bank-eltnmina/hooks/636588703/deliveries --jq '.[0].id')
gh api -X POST repos/Kareem-3del/bank-eltnmina/hooks/636588703/deliveries/$last/attempts
```

### Rotating the webhook secret

```sh
NEW=$(openssl rand -hex 32)
printf 'WEBHOOK_SECRET=%s\n' "$NEW" | ssh kareem 'umask 077; cat > /opt/redf-demo/hook.env'
ssh kareem 'cd /opt/redf-demo && docker compose up -d redf-deploy-hook'   # reload env
gh api -X PATCH repos/Kareem-3del/bank-eltnmina/hooks/636588703 \
  -f 'config[secret]='"$NEW" -f 'config[url]=https://demo.kareem-3del.com/_deploy-hook' \
  -f 'config[content_type]=json'
```

## Per-page PDFs (the floating "download this page" button)

`js/actions.js` injects the floating side actions (prev / next / download-page /
download-full-report). "Download this page" points at
`assets/pdf/<lang>/<slug>.pdf`; "download full report" points at
`assets/pdf/<lang>/MT-final.pdf` (the original 172-page report — **do not
regenerate it**). The per-page PDFs are committed into `frontend/` so the webhook
deploy ships them like any other asset.

Those per-page PDFs are rendered from the live pages by `deploy/pdfgen/`. The
pages are GSAP/ScrollTrigger driven (sections reveal on scroll, counters animate
from 0, Chart.js draws on init), so the generator emulates `prefers-reduced-motion`,
force-loads images, scroll-sweeps to fire every trigger, forces all reveal
elements + charts to their final state, then prints one continuous tall page
(matching the single-page format of the originals). Regenerate after redesigning
pages:

```sh
cd deploy/pdfgen && npm install            # one-time (downloads Chromium)
cd ../../frontend && python3 -m http.server 8124 &   # serve the site locally
cd ../deploy/pdfgen && node generate.mjs   # all langs/pages  (or: node generate.mjs en strategic-direction)
```

Output lands in `frontend/assets/pdf/{en,ar}/`. Commit + push; the webhook
deploys them. `node_modules/` is gitignored. (These are large binaries — ~350 MB
per full regen — committed to git per the existing convention; consider Git LFS
if repo size becomes a problem.)

## Quick local redeploy (bypassing CI)

After editing files in `frontend/`, push them to the live server:

```sh
rsync -az --delete -e ssh \
  /Users/kareem.adel.zayed/bank-eltnmina/frontend/ \
  kareem:/opt/redf-demo/site/
```

That's it. Files are bind-mounted **read-only** into the container, nginx picks them up immediately — **no restart needed**. Verify:

```sh
curl -sI https://demo.kareem-3del.com/ | head -3
```

If you change `nginx.conf` (caching/headers), reload the worker:

```sh
ssh kareem 'docker exec redf-demo nginx -s reload'
```

## SSH alias

`~/.ssh/config` already has:

```
Host kareem
    HostName 76.13.151.228
    User root
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

So `ssh kareem` lands on the host. The username **on the alias** is `root`; the SSH key is `~/.ssh/id_ed25519`.

## Server layout

| Path                                | Purpose                                            |
|-------------------------------------|----------------------------------------------------|
| `/opt/redf-demo/site/`              | Bind-mounted document root (mirror of `frontend/`) |
| `/opt/redf-demo/docker-compose.yml` | Container + Traefik labels                         |
| `/opt/redf-demo/nginx.conf`         | nginx server block (cache/gzip rules)              |
| `/opt/bdayatech/traefik/`           | Traefik (existing, shared) — do not edit from here |

Container name: `redf-demo` · network: `traefik-public` · routes via Traefik labels for `demo.kareem-3del.com` (HTTP→HTTPS redirect, Let's Encrypt resolver `letsencrypt`).

## Container lifecycle

```sh
ssh kareem 'cd /opt/redf-demo && docker compose ps'
ssh kareem 'cd /opt/redf-demo && docker compose restart'                  # bounce both
ssh kareem 'cd /opt/redf-demo && docker compose down'                     # stop
ssh kareem 'cd /opt/redf-demo && docker compose up -d'                    # bring up
ssh kareem 'docker logs --tail 50 redf-demo'                              # nginx logs
ssh kareem 'docker logs --tail 50 redf-deploy-hook'                       # deploy-hook logs
ssh kareem 'cd /opt/redf-demo && docker compose up -d --build redf-deploy-hook'  # rebuild hook after editing deploy/hook/*
```

After editing anything under `deploy/`, re-sync it to the server before rebuilding:

```sh
scp -P 2222 deploy/hook/hook.py deploy/hook/Dockerfile root@76.13.151.228:/opt/redf-demo/hook/
scp -P 2222 deploy/docker-compose.yml root@76.13.151.228:/opt/redf-demo/docker-compose.yml
```

## DNS

`demo.kareem-3del.com` → `76.13.151.228` (zagel). If the IP changes, also update Traefik wouldn't matter — labels resolve by container, only DNS needs to follow the host.

## Cert troubleshooting

Traefik stores ACME state at `/opt/bdayatech/traefik/certs/acme.json`. If issuance fails:

```sh
ssh kareem 'docker logs --tail 100 traefik 2>&1 | grep -i -E "acme|cert|demo.kareem"'
```

The HTTP-01 challenge needs port 80 reachable from Let's Encrypt — Traefik already serves `:80` and the redirect router's middleware fires *after* the challenge responder, so the challenge works.

## Rollback

There's no versioning on the bind mount — `rsync --delete` overwrites. To revert, push from a clean local checkout (or use `git` once the repo is initialised). For an emergency take-down:

```sh
ssh kareem 'cd /opt/redf-demo && docker compose down'
```

## First-time bootstrap (recorded for reference)

The full set of commands originally used to provision this deploy:

```sh
# 1. Copy files
ssh kareem 'mkdir -p /opt/redf-demo/site'
rsync -az --delete -e ssh frontend/ kareem:/opt/redf-demo/site/

# 2. Compose + nginx config (heredoc'd to /opt/redf-demo/) — content lives
#    in this repo's git history. The compose attaches the container to the
#    `traefik-public` network and adds Traefik labels for the domain.

# 3. Bring it up
ssh kareem 'cd /opt/redf-demo && docker compose up -d'
```
