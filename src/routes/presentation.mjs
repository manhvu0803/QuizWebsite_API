import express, { query } from "express";
import * as db from "../database/questionDatabase.mjs";
import { sendData, sendError, resolve, run, getUsername } from "./routeUtils.mjs";

const router = express.Router();

router.get("/create", async (req, res) => {
    try {
        let result = await db.addPresentation(getPresentationName(req.query), req.user.name);
        await addSlide(result.lastID);
        sendData(res, { presentationId: result.lastID });
    }
    catch (error) {
        sendError(res, error);
    }
})

router.get("/get", (req, res) => {
    let id = getPresentationId(req.query) ?? req.query.id;
    if (id) {
        run(res, async () => {
            let presentation = await db.getPresentation(id);
            presentation.slides = await db.getSlidesOf(id);
        });
        
        return;
    }

    let username = getUsername(req.query);

    if (username) {
        resolve(res, db.getPresentationsOf(username));
    }
    else {
        resolve(res, db.getPresentationsOf(req.user.name));
    }
})

router.get("/update", (req, res) => {
    let query = req.query;
    let data = {
        name: req.query.name ?? req.query.presentationName ?? req.query.presentationname,
        group: req.query.group ?? req.query.groupName ?? req.query.groupname
    }
    
    resolve(res, db.updatePresentation(getPresentationId(req.query) ?? req.query.id, data));
})

router.get("/delete", (req, res) => {
    resolve(res, db.removePresentation(getPresentationId(req.query) ?? req.query.id, req.query));
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

router.get("/getSlide", async (req, res) => {
    if (req.query.id) {
        run(res, async () => {
            let slide = await db.getSlide(getSlideId(req.query) ?? req.query.id);
            slide.answers = await db.getAnswersOf(slide.id);
            return slide;
        })

        return;
    }

    resolve(res, db.getSlidesOf(getPresentationId(req.query)));
})

router.get("/updateSlide", (req, res) => {
    resolve(res, db.updateSlide(getSlideId(req.query), req.query.question));
})

router.get("/deleteSlide", (req, res) => {
    let id = getSlideId(req.query);
    if (id) {
        resolve(res, db.removeSlide(id, req.query));
        return;
    }

    let presentationId = getPresentationId(req.query);
    resolve(res, db.removeSlidesOf(presentationId));
})

router.get("/addAnswer", async (req, res) => {
    let query = req.query;
    resolve(res, db.addAnswer(getSlideId(query), getAnswerText(query), getCorrect(query)));
})

router.get("/updateAnswer", (req, res) => {
    resolve(res, db.updateAnswer(getAnswerId(req.query), getAnswerText(req.query)));
})

router.get("/deleteAnswer", (req, res) => {
    resolve(res, db.removeAnswer(getAnswerId(req.query)));
})

export default router;

function getPresentationName(query) {
    return query.presentationName ?? query.presentationname ?? query.name;
}

function getPresentationId(query) {
    return query.presentationId ?? query.presentationid ?? query.presentationnID;
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
