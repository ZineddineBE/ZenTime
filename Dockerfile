FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts .

# --ignore-scripts : on n'exécute pas aveuglément les scripts d'installation
# de tout l'arbre de dépendances (protection contre un paquet compromis).
# bcrypt en a un pour sélectionner son binaire natif : on le reconstruit
# ensuite explicitement, lui seul, en connaissance de cause.
RUN npm ci --ignore-scripts
RUN npm rebuild bcrypt
# --no-install : interdit à npx d'aller chercher un paquet sur le registre
# s'il n'est pas déjà installé localement (il l'est, via npm ci juste au-dessus).
RUN npx --no-install prisma generate

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# On évite de faire tourner l'application en root dans le conteneur final.
RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]