# Football Pace

Football Pace is a version of the standings table that accounts for
strength of schedule. It looks at historical data to see how a typical
champion performs in each match, based on home/away and the opponent's
finishing position. It then presents a new version of the
standings table, that shows how each team is doing compared to typical
championship pace, given their schedule so far.

# Architecture

There are two major subfolders of the codebase:

* [WWW](/www): A Next.js app that powers the front-end and webservers.
* [Data](/data): A Dagster pipeline that powers the data ingestion.

The data pipeline is deployed locally using Docker, and the data is
written to a Vercel DB.

# Contributing

This is very much a solo side project that I'm doing for my own
education/entertainment, and at my own cadence; while I welcome 
feedback or feature requests at feedback@footballpace.com, I can't
offer any guarantees that PRs or Issues will be addressed.

# Name

This is version 2 of this project; this new one uses Next.js as
the front-end and is the "next" version of the project, hence
the name.
