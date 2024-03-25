FROM node:16


WORKDIR /usr/src/app/category


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3005


CMD ["npm", "start"]
