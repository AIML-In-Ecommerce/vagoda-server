FROM node:16

# RUN rm -rf /usr/src/app

WORKDIR /usr/src/datn/widget


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3010


CMD ["npm", "start"]
