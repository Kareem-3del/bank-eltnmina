# Deploy — demo.kareem-3del.com

Static site (`frontend/`) is served by an `nginx:alpine` container behind the existing Traefik reverse proxy on the `zagel` host. Let's Encrypt issues the cert.

## Auto-deploy (CI/CD)

`.github/workflows/deploy.yml` runs on every push to `main` that touches `frontend/**` (or the workflow itself). The job rsyncs `frontend/` to `/opt/redf-demo/site/` on the server and verifies the site returns `200` for both EN and AR.

Required GitHub repo secrets (set once via `gh secret set <NAME>`):

| Secret             | Purpose                                                                     |
|--------------------|-----------------------------------------------------------------------------|
| `DEPLOY_SSH_KEY`   | Private half of the dedicated CI deploy keypair (`~/.ssh/redf-ci-deploy`).  |
| `SSH_KNOWN_HOSTS`  | Output of `ssh-keyscan -p 2222 -t ed25519,rsa,ecdsa 76.13.151.228`.         |

Manual trigger from the CLI: `gh workflow run "Deploy to demo.kareem-3del.com"`.

Watch the latest run: `gh run watch -R Kareem-3del/bank-eltnmina`.

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
ssh kareem 'cd /opt/redf-demo && docker compose restart'    # bounce nginx
ssh kareem 'cd /opt/redf-demo && docker compose down'       # stop
ssh kareem 'cd /opt/redf-demo && docker compose up -d'      # bring up
ssh kareem 'docker logs --tail 50 redf-demo'                # tail logs
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
