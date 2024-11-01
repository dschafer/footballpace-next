#!/bin/sh
git remote update
if [ $(git status | grep behind |  wc -l) -gt 0 ]; then
  git pull
  docker compose --env-file ../.env up --detach --build dagster-footballpace-data
fi
