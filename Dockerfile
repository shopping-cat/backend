# BUILDER
FROM node:12 AS builder
WORKDIR /app
COPY . .
RUN ls -a
RUN npm install
RUN npm run build:silent

# RUNNER
FROM node:12
WORKDIR /app
COPY --from=builder app/dist ./dist
COPY assets ./assets
COPY package.json .
COPY pm2.json .
RUN npm install --production
EXPOSE 80
CMD ["npm", "run", "pm2"]