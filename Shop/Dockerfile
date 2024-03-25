FROM node:16


WORKDIR /usr/src/datn/shop


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3004


CMD ["npm", "start"]
