# Football Pace: Data Docker

This folder contains the scripts needed to run the data pipeline in Docker containers.

## Running locally

To run it, make sure your working directory is `data/docker`, and ensure there is a `.env` file in `data/` that matches [.env.sample](../.env.sample), then run

```sh
docker compose --env-file ../.env build --no-cache
docker compose --env-file ../.env up
```

## Keeping updated

Both images install dependencies from `data/uv.lock` with `uv sync --locked`. The
user-code image installs the project and its `docker` extra; the webserver/daemon
image installs only the `dagster` dependency group from `data/pyproject.toml`. Its
final image contains the virtual environment and Dagster configuration, without
the pipeline code, its extra dependencies, or uv.

After changing dependencies, run `uv lock` from `data/` and commit both
`pyproject.toml` and `uv.lock`. Rebuild and redeploy the user-code, webserver, and
daemon services together so they use the same lockfile revision.

To keep the Docker deployment updated, run [update.sh](update.sh) (or add its absolute path to a crontab). It runs from its own directory, so it can be invoked from any working directory. The deployment checkout should be on `main`, tracking `origin/main`; the script pulls the current branch's configured upstream with `git pull --ff-only` and stops if the pull fails.

Every successful pull, including when Git is already up to date, is followed by `docker compose --env-file ../.env up --detach --build` for the whole project. This applies app code, webserver, daemon, and other Compose changes, and retries deployment on the next run if a previous build or startup failed. Compose uses cached builds and leaves unchanged running containers alone. Services with changed images or configuration are recreated as needed, preserving mounted volumes, including the PostgreSQL data volume.
