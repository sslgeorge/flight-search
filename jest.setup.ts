import { AppDataSource } from "./src/data-source";

process.env = {
  PORT: "9009",
  NODE_ENV: "test",
};

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});
