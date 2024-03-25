FROM node:16


WORKDIR /usr/src/app/cart


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3003


CMD ["npm", "start"]
