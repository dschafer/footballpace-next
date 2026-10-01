#!/bin/sh
set -eu

cd "$(dirname "$0")"
git pull --ff-only
docker compose --env-file ../.env up --detach --build
