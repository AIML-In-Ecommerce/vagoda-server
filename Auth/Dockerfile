FROM node:16


WORKDIR /usr/src/datn/auth


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3001


CMD ["npm", "start"]
