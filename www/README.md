# Football Pace: WWW

This subfolder is a top-level Next.js app for the front-end and webserver.

## Architecture

This was started using the Next.js [Postgres + Prisma](https://vercel.com/templates/next.js/postgres-prisma) template.

It uses a Vercel Postgres DB as the storage, and Prisma as the ORM layer in between.

The front-end uses Mantine as the component library, with Tabler icons.

## Running locally

To run this locally, using the package manager of the choice (in this
example I'll use `pnpm`), you should install the dependencies then run:

```sh
pnpm dev
```

for rapid development, or

```sh
pnpm build
pnpm start
```

to test the production build.

For changes to the prisma schema, `pnpm build` will also commit those.
