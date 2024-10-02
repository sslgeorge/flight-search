import { Router } from "express";
import type { Request, Response } from "express";

export const routes = () => {
  const router = Router();

  router.get("search", (req: Request, res: Response) => {
    return res.json([]);
  });

  return router;
};
