FROM node:16


WORKDIR /usr/src/datn/bankstatement


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3020


CMD ["npm", "start"]
