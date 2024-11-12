# Football Pace: Data Docker

This folder contains the scripts needed to run the data pipeline in Docker containers.

## Running locally

To run it, make sure your working directory is `data/docker`, and ensure there is a `.env` file in `data/` that matches [.env.sample](../.env.sample), then run

```sh
docker compose --env-file ../.env build --no-cache
docker compose --env-file ../.env up
```

## Keeping updated

To keep the docker deployment updated with new changes, run [update.sh](update.sh) (or add it to a crontab). That will pull changes from origin/main, then redeploy the app code container.
