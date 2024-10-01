import request from "supertest";
import { app } from "../src/index";

describe("SampleController", () => {
  describe("when POST to /Sample", () => {
    it("should create a new user entry", async () => {
      const response = await request(app).post("/Sample");

      expect(response.status).toBe(200);
    });
  });
});
