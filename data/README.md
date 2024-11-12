# Football Pace: Data

This subfolder is a top-level Dagster pipeline for data ingestion.

## Running locally

First, you need a copy of the environment variables; these should go into
`.env` and should match the format of [.env.sample](.env.sample).

You should then install the dependencies in [requirements.txt](requirements.txt),
then run:

```sh
dagster dev
```

## Deploying

For production deployment, the [/docker](docker) subfolder has
all of the necessary scripts and instructions.
