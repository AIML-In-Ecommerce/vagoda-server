FROM node:16


WORKDIR /usr/src/datn/category


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3005


CMD ["npm", "start"]
