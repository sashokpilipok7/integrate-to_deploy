FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./


COPY . .

RUN npm install
RUN npm run build-tsc

EXPOSE 8081

CMD ["node", "dist/index.js"]
