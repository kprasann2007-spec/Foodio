import express from "express";
import { createPromo, validatePromo, listPromos } from "../controllers/promoController.js";
import authMiddleware from "../middleware/auth.js";

const promoRouter = express.Router();

promoRouter.post("/add", authMiddleware, createPromo);
promoRouter.post("/validate", authMiddleware, validatePromo);
promoRouter.get("/list", listPromos);

export default promoRouter;
