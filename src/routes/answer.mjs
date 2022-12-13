import { Server } from "socket.io";
import { Router } from "express";
import * as db from "../database/questionDatabase.mjs";
import { resolve, run, sendData, sendError } from "./routeUtils.mjs";

const socket = new Server();

const router = Router();

router.get("/answer", async (req, res) => {
    let option = db.getOption(req.query.optionId);
    if (!option) {
        sendError(res, "Option doesn't exists");
        return;
    }

    run(res, async () => {
        let addPromise = db.addAnswer(req.user.username, option.id);
        let slide = await db.getSlideOf(option.id);

        socket.emit(`/slide/${slide.id}`);
        
        return addPromise;
    });
})