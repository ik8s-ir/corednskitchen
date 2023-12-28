# ---------- Base ----------
FROM dr.ik8s.ir/node:18-alpine AS base
WORKDIR /coredns-kitchen
# ---------- Build ----------
FROM base AS builder
COPY . .
RUN yarn && yarn build && yarn install --production

# ---------- Release ----------
FROM base AS release

COPY --from=builder /coredns-kitchen/node_modules ./node_modules
COPY --from=builder /coredns-kitchen/dist ./dist

USER node
CMD ["node", "./dist/main.js"]