FROM node:18-alpine

# Install system dependencies required for bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild bcrypt to ensure it's compiled correctly
RUN apk add --no-cache make gcc g++ python3 && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3
    
# Copy the rest of the project
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# *Build the TypeScript project* ✅
RUN pnpm build


# Start the application
CMD ["node", "dist/main"]