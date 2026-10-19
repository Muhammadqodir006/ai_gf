import { Router } from "express";
import { postChat } from "../controllers/chat.controller";

const router = Router();
router.post("/chat", postChat);
export default router;