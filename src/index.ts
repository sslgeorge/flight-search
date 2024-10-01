import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import { routes } from "./routes";
import pino from "pino";
import pinoHttp from "pino-http";
const PORT = process.env.PORT || 9001;

export const app = express();

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      singleLine: true,
      translateTime: true,
    },
  },
});

AppDataSource.initialize()
  .then(async () => {
    const router = routes();

    app.use(bodyParser.json());
    app.use(pinoHttp({ logger }));
    app.use(router);
    app.listen(PORT);
    console.log(`Express server has started on port ${PORT}`);
  })
  .catch((error) => console.log(error));
