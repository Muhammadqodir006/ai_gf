import type { Request, Response } from "express";
import { Role } from "../generated/prisma/client";
import * as ai from "../services/ai.service";
import {getFacts, saveFacts} from "../services/memory.service";
import {getCurrentMood, saveMood} from "../services/mood.service";
import {
    getLastTwo,
    getRecentHistory,
    saveMessage,
} from "../services/message.service";

export async function postChat(req: Request, res: Response) {
    const content = String(req.body?.content ?? "").trim();
    if(!content) return res.status(400).json({error: "Xabar bo'sh"});
    if(content.length > 2000) {
        return res.status(400).json({error: "Xabar juda uzun"});
    }
    const [last] = await getLastTwo();
    const gapMs = last ? Date.now() - last.createdAt.getTime() : 0;
    const [history, mood, facts] = await Promise.all([
        getRecentHistory(20),
        getCurrentMood(),
        getFacts(),
    ]);
    const reply = await ai.chat({
        mood,
        facts,
        history,
        gapMs,
        userMessage: content,
    });
    await saveMessage(Role.USER, content);
    await saveMessage(Role.ASSISTANT, reply.reply);
    const newMood = await saveMood(reply);
    await saveFacts(reply.new_facts);
    res.json({reply: reply.reply, mood: newMood});
}
