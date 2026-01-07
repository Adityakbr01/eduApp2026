FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/next.config.js ./next.config.js

RUN npm install -g pm2
EXPOSE 3000
#CMD [ "npm","run", "start" ]
#agar niche wala line chalaye to pm2 ke through chalega app
CMD ["pm2-runtime", "node_modules/.bin/next", "start"]