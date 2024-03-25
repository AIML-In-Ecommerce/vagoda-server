FROM node:16


WORKDIR /usr/src/datn/review


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3007


CMD ["npm", "start"]
