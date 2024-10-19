# Docker scripts for dagster pipeline

This folder contains the scripts needed to run the football-pace data pipeline in Docker containers.

To run it, make sure your working directory is `data/docker`, and ensure there is a `.env` file in `data/` that matches the sample env file, then run:

```bash
docker compose up --build --env-file=../.env
```
