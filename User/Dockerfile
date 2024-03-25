FROM node:16

RUN rm -rf /usr/src/app

WORKDIR /usr/src/datn/user


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3002


CMD ["npm", "start"]
