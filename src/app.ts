import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes";
import messagesRoutes from "./routes/messages.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors({origin: process.env.FRONTEND_URL ?? "http://localhost:3000"}));
app.use(express.json());

app.use(chatRoutes);
app.use(messagesRoutes);
app.use(errorHandler);

export default app;