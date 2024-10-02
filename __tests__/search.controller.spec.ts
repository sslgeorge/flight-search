import request from "supertest";
import { app } from "../src/index";

describe("Search Controller", () => {
  describe("when GET /search", () => {
    it("should return the a list of available search", async () => {
      const response = await request(app).get("/search");

      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(500);
    });
  });

  describe("when GET /search with startDate & endDate", () => {
    it.only("should return the a list of available search", async () => {
      const queryObj = {
        startDate: "2017-06-01T21:21:17.274Z",
        endDate: "2017-06-01T21:21:17.331Z",
      };
      const searchParams = new URLSearchParams(queryObj);

      const response = await request(app).get(
        "/search?" + searchParams.toString()
      );

      expect(response.body.length).toEqual(24);
    });
  });
});
