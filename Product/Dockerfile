FROM node:16


WORKDIR /usr/src/datn/product


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3006


CMD ["npm", "start"]
