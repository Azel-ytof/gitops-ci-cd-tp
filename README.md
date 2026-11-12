# CircuitCourt

TEST

Order directly from local farmers, pick up your basket at the farm.
Training project for the **GitOps and CI/CD** module (Les Producteurs du Coin and Lambda Studio are fictional).

## Before the course

Do this at home **before the first day**, on your own computer (Linux, macOS or Windows). It takes about 30 minutes.

| Tool | Check |
|---|---|
| Git | `git --version` |
| Node.js 22.18 or later | `node --version` |
| Docker: Docker Desktop on Windows and macOS (give it at least 4 GB of memory), Docker Engine and Compose on Linux | `docker version`, then `docker compose version` |
| VS Code | |
| A GitHub account that can push | `git push` works from your computer (browser login or SSH key) |

Then download the Docker images used during the course, so that the classroom network is not overloaded:

```bash
docker pull sonarqube:26.10.0.133078-community
docker pull myoung34/github-runner:2.338.0-ubuntu-noble
docker pull node:24
docker pull node:24-alpine
```

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000, restarts on every change
npm test               # unit and API tests (Vitest, Supertest)
npm run test:coverage  # the same, with the coverage report (coverage/)
npm run lint           # linter and formatter (Biome); npm run lint:fix fixes what it can
npm run build          # compiles the TypeScript into dist/
npm start              # runs the compiled version
```

## Project layout

| Path | Content |
|---|---|
| `src/` | The API (Express) and the business rules (`src/domain/`) |
| `public/` | The web page |
| `tests/` | The tests |
| `tools/` | Helper scripts (see below) |
| `.github/workflows/` | The pipelines (GitHub Actions) |
| `.husky/` | The Git hooks (run before each commit) |
| `infra/` | A self-hosted GitHub Actions runner and a SonarQube server, on your computer |
| `deploy/` | What runs in production (Docker Compose) |
| `docs/` | The measures of the group (TP 5 and TP 6) |

## Business rules

| Rule | Statement |
|---|---|
| RG-01 | Each line of the cart refers to a product of the catalog |
| RG-02 | Whole quantity, from 1 to 20 per product |
| RG-03 | 5 % discount from €50 of purchases, rounded to the cent |
| RG-04 | Pickup: €2 fee under €30 (after discount), free from €30 |
| RG-05 | Minimum order: €10 |
| RG-06 | Pickup from Tuesday to Saturday, at 9 am or 4 pm, at least 24 hours after the order |

## API

| Route | Purpose |
|---|---|
| `GET /health` | Application status (used by the Docker healthcheck) |
| `GET /api/products` | The catalog |
| `POST /api/cart/quote` | Price of a cart: `{ "lines": [{ "productId": "p1", "quantity": 2 }] }` |
| `GET /api/slots` | The next pickup slots |
| `POST /api/orders` | Places an order: `{ customer: { name, email }, lines, slot }` |

## Tools

| Command | Purpose |
|---|---|
| `npm run gitleaks` | Looks for secrets in the whole Git history |
| `npm run observatory -- circuitcourt.localhost:3000` | Grades the HTTP security headers (Mozilla Observatory) |
| `npm run weight -- <image> [max MB]` | Weight of the code, the site, the dependencies and the Docker image (with an optional budget) |
| `npm run images:optimize` | Converts the images to WebP |
| `npm run changelog` | Writes CHANGELOG.md from the commits (git-cliff) |

`infra/` starts a GitHub Actions runner and a SonarQube server on your computer: copy `.env.example` to `.env`, fill it in, then `docker compose up -d` from `infra/`.
From TP 4 on, this runner also deploys the application "in production" on your computer, as described by `deploy/compose.yml`: http://localhost:8088.

## Training

The `TODO TP N` comments tell you what to do in each TP. At the end of each TP, the trainer publishes its solution as a branch (`tp-1` to `tp-6`).
Your measures (TP 5 and TP 6) go into `docs/measures.md`.

If your group is behind, catch up with the trainer's branch (here, TP 2), then merge the pull request.
All your files are replaced by the ones of the branch. From TP 4 on, put your GitHub id and your image tag back into `deploy/compose.yml`.

```bash
git fetch upstream
git switch -c catch-up-tp-2
git restore --source=upstream/tp-2 --staged --worktree .
npm install
git commit -m "chore: catch up with TP 2"
git push -u origin catch-up-tp-2
```
