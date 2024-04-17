import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
dotenv.config();

const port = process.env.PRODUCT_PORT;

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "swagger",
      version: "0.1.0",
      description: "product api",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LogRocket",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://14.225.218.109:" + port,
      },
    ],
  },
  apis: ["./product.route.js"],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
