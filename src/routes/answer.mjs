import { Server } from "socket.io";
import { Router } from "express";
import * as db from "../database/questionDatabase.mjs";
import { run, sendError } from "./routeUtils.mjs";

var socket;

const router = Router();

router.get("/answer", async (req, res) => {
    let option = db.getOption(req.query.optionId);
    if (!option) {
        sendError(res, "Option doesn't exists");
        return;
    }

    run(res, async () => {
        let addPromise = db.addAnswer(req.user.username, option.id);
        socket.emit(`/slide/${option.slideId}`);
        
        return addPromise;
    });
})

router.get("/removeAnswer", async (req, res) => {
    let option = db.getOption(req.query.optionId);
    if (!option) {
        sendError(res, "Option doesn't exists");
        return;
    }

    run(res, async () => {
        let addPromise = db.removeAnswer(req.user.username, option.id);
        socket.emit(`/slide/${option.slideId}`);
        
        return addPromise;
    });
})

export function answerRoute(socketio) {
    socket = socketio;
    return router;
}