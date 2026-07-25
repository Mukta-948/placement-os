import { Router } from "express";

export function healthRouter(): Router {
  const router = Router();
  router.get("/health", (_request, response) => response.status(200).json({ status: "ok", service: "placement-prep-agent" }));
  return router;
}
