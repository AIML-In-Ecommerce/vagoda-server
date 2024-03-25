FROM node:16


WORKDIR /usr/src/app/order


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3009


CMD ["npm", "start"]
