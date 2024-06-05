FROM node:16


WORKDIR /usr/src/datn/statistics


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3012


CMD ["npm", "start"]
