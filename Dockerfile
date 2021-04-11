FROM node:12.18.3

WORKDIR /app

COPY package.json .
COPY schema.prisma .
COPY ecosystem.config.js .
COPY dist dist/
# COPY gcpServiceAccountKey.json .
# COPY serviceAccountKeySeller.json .
# COPY serviceAccountKeyUser.json .
# COPY .env .

RUN npm install --production --force
RUN npm run generate:prisma

EXPOSE 80

CMD ["npm", "run", "pm2"]

# run npm build first

# docker build -t asia.gcr.io/shoppingcat/dev-back:0.0.10 .
# docker push asia.gcr.io/shoppingcat/dev-back:0.0.10

# docker run --name shopping-cat-back-con -p 80:80 asia.gcr.io/shoppingcat/dev-back:0.0.5