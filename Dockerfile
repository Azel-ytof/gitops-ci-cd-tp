FROM node:24 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit-=dev

FROM node:24 AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules  ./node_modules
COPY public ./public
COPY package.json ./
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
