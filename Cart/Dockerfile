FROM node:16


WORKDIR /usr/src/datn/cart


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3003


CMD ["npm", "start"]
