FROM node:16

RUN rm -rf /usr/src/app

WORKDIR /usr/src/datn/payment


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3011


CMD ["npm", "start"]
