FROM node:16


WORKDIR /usr/src/datn/order


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3009


CMD ["npm", "start"]
