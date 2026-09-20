# RR GROUP Backend — production image
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 10000
CMD ["node", "dist/server.js"]