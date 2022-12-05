import express, { query } from "express";
import * as db from "../database/questionDatabase.mjs";
import { sendData, sendError, run, getUsername } from "./routeUtils.mjs";

function getPresentationName(query) {
    return query.presentationName ?? query.presentationname ?? query.name;
}

function getPresentationId(query) {
    return query.presentationId ?? query.presentationid ?? query.presentationnID ?? query.id;
}

function getSlideId(query) {
    return query.slideId ?? query.slideid ?? query.slideID;
}

function getAnswerText(query) {
    return query.answerText ?? query.answertext ?? query.answer;
}

function getCorrect(query) {
    return query.isCorrect ?? query.iscorrect ?? query.correct;
}

const router = express.Router();

router.get("/add", async (req, res) => {
    try {
        let result = await db.addPresentation(getPresentationName(req.query), req.user.username);
        await addSlide(result.lastID);
        sendData(res, { presentationId: result.lastID });
    }
    catch (error) {
        sendError(res, error);
    }
})

router.get("/get", (req, res) => {
    if (req.query.id) {
        run(res, db.getPresentation(req.query.id));
        return;
    }

    run(res, db.getPresentationsOf(getUsername(req.query)));
})

router.get("/update", (req, res) => {
    run(res, db.updatePresentation(req.query.id, req.query));
})

router.get("/addSlide", async (req, res) => {
    try {
        let result = await addSlide(getPresentationId(req.query));
        sendData(res, { slideId: result.lastID });
    }
    catch (error) {
        sendError(res, error);
    }
})

async function addSlide(presentationId) {
    let result = await db.addSlide(presentationId, "");
    await db.addAnswer(result.lastID, "", true);
    await db.addAnswer(result.lastID, "", false);
    return result;
}

router.get("/getSlide", (req, res) => {
    if (req.query.id) {
        run(res, db.getSlide(req.query.id));
        return;
    }

    run(res, db.getSlidesOf(getPresentationId(req.query)));
})

router.get("/updateSlide", (req, res) => {
    run(res, db.updateSlide(req.query.id, req.query.question));
})

router.get("/addAnswer", async (req, res) => {
    let query = req.query;
    run(res, db.addAnswer(getSlideId(query), getAnswerText(query), getCorrect(query)));
})

router.get("/getAnswer", (req, res) => {
    run(res, db.getAnswersOF(getSlideId(req.query)));
})

router.get("/updateAnswer", (req, res) => {
    run(res, db.updateAnswer(req.query.id, getAnswerText(req.query)));
})

export default router;