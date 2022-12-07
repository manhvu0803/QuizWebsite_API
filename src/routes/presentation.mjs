import express, { query } from "express";
import * as db from "../database/questionDatabase.mjs";
import { sendData, sendError, resolve, getUsername } from "./routeUtils.mjs";

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
    let id = getPresentationId(req.query);
    if (id) {
        resolve(res, db.getPresentation(id));
        return;
    }

    resolve(res, db.getPresentationsOf(getUsername(req.query)));
})

router.get("/update", (req, res) => {
    resolve(res, db.updatePresentation(getPresentationId(req.query), req.query));
})

router.get("/delete", (req, res) => {
    resolve(res, db.removePresentation(getPresentationId(req.query), req.query));
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
        resolve(res, db.getSlide(req.query.id));
        return;
    }

    resolve(res, db.getSlidesOf(getPresentationId(req.query)));
})

router.get("/updateSlide", (req, res) => {
    resolve(res, db.updateSlide(getSlideId(req.query), req.query.question));
})

router.get("/deleteSlide", (req, res) => {
    resolve(res, db.removeSlide(getSlideId(req.query), req.query));
})

router.get("/addAnswer", async (req, res) => {
    let query = req.query;
    resolve(res, db.addAnswer(getSlideId(query), getAnswerText(query), getCorrect(query)));
})

router.get("/getAnswer", (req, res) => {
    resolve(res, db.getAnswersOF(getSlideId(req.query)));
})

router.get("/updateAnswer", (req, res) => {
    resolve(res, db.updateAnswer(getAnswerId(req.query), getAnswerText(req.query)));
})

router.get("/updateAnswer", (req, res) => {
    resolve(res, db.updateAnswer(getAnswerId(req.query), getAnswerText(req.query)));
})

export default router;

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

function getAnswerId(query) {
    return query.answerId ?? query.answerid ?? query.answerID;
}

function getCorrect(query) {
    return query.isCorrect ?? query.iscorrect ?? query.correct;
}
