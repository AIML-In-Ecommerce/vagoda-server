FROM node:16


WORKDIR /usr/src/app/promotion


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3008


CMD ["npm", "start"]
