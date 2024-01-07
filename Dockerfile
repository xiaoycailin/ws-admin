FROM node:20.10.0
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 2700

CMD [ "node", "server.js" ]