#!/bin/sh

# Run Prisma migrations
pnpm prisma migrate deploy

# Start the application
pnpm start:prod
