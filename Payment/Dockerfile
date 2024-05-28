FROM node:16

RUN rm -rf /usr/src/app

WORKDIR /usr/src/datn/widget


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3011


CMD ["npm", "start"]
