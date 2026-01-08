# ------------------------
# Build stage
# ------------------------

FROM node:20-alpine AS builder
WORKDIR /app

# Next.js by default anonymous usage data (telemetry) send karta hai
# Docker / production builds me unnecessary hota hai,
# isliye isko disable kar rahe hain for clean & policy-friendly builds
ENV NEXT_TELEMETRY_DISABLED=1 

# Package files copy kar rahe hain taaki npm ci fast aur reliable ho
COPY package.json package-lock.json ./

# npm ci use kar rahe hain kyunki ye exact lock file ke versions install karta hai
# CI/CD aur Docker builds ke liye best practice hai
RUN npm ci

# Baaki project files copy kar rahe hain
COPY . .

# Next.js production build generate kar rahe hain
RUN npm run build

# ------------------------
# Production image
# ------------------------

FROM node:20-alpine
WORKDIR /app

# Production mode enable kar rahe hain for better performance
ENV NODE_ENV=production

# Runtime pe bhi telemetry disable rakhenge
# taaki container run hote time bhi koi data send na ho
ENV NEXT_TELEMETRY_DISABLED=1

# Sirf required build output copy kar rahe hain
# taaki image size chhota rahe
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js server 3000 port pe chalega
EXPOSE 3000

# Standalone Next.js server start kar rahe hain
CMD ["node", "server.js"]
