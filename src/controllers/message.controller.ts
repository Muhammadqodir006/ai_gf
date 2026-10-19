import type { Request, Response } from "express";
import { Role } from "../generated/prisma/client";
import * as ai from "../services/ai.service";
import {getFacts, saveFacts} from "../services/memory.service";
import {
    applyAbsence,
    getCurrentMood,
    saveMood,
} from "../services/mood.service";
import {
    getLastTwo,
    getRecentHistory,
    listMessages,
    saveMessage,
} from "../services/message.service";

const FIVE_HOURS = 5 * 60 * 60 * 1000;

async function maybeCreateProactive() {
    const [last, prev] = await getLastTwo();
    if(!last) return;
    const gapMs = Date.now() - last.createdAt.getTime();
    if(gapMs < FIVE_HOURS) return;
    if (last.role === Role.ASSISTANT && prev?.role === Role.ASSISTANT) return;
    await applyAbsence(gapMs);
    const [mood, facts, history] = await Promise.all([
        getCurrentMood(),
        getFacts(),
        getRecentHistory(20),
    ]);
    const reply = await ai.proactive({mood, facts, history, gapMs});
    const minutesAgo = 20 + Math.floor(Math.random() * 70);
    await saveMessage(
        Role.ASSISTANT,
        reply.reply,
        new Date(Date.now() - minutesAgo * 60 * 1000)
    );
    await saveMood(reply);
    await saveFacts(reply.new_facts);
}

export async function getMessages(_req: Request, res: Response ) {
    try {
        await maybeCreateProactive();
    }catch (err) {
        console.error("Proaktiv xabar xatosi: ", err);
    }
    const [messages, mood] = await Promise.all([
        listMessages(50),
        getCurrentMood(),
    ]);
    res.json({messages, mood});
}