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
            return presentation;
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
        name: query.presentationName ?? query.presentationname ?? query.name,
        group: query.group ?? query.groupName ?? query.groupname
    }
    
    resolve(res, db.updatePresentation(getPresentationId(query) ?? query.id, data));
})

router.get("/delete", (req, res) => {
    resolve(res, db.removePresentation(getPresentationId(req.query) ?? req.query.id, req.query));
})

router.get("/addSlide", async (req, res) => {
    try {
        let result = await addSlide(getPresentationId(req.query));
        let slide = await getFullSlide(result.lastID);
        sendData(res, slide);
    }
    catch (error) {
        sendError(res, error);
    }
})

async function addSlide(presentationId) {
    let result = await db.addSlide(presentationId, "Question");
    await db.addOption(result.lastID, "Answer 1", true);
    await db.addOption(result.lastID, "Answer 2", false);
    return result;
}

router.get("/getSlide", async (req, res) => {
    let slideId = getSlideId(req.query) ?? req.query.id;
    if (slideId) {
        run(res, getFullSlide);

        return;
    }

    resolve(res, db.getSlidesOf(getPresentationId(req.query)));
})

async function getFullSlide(slideId) {
    let slide = await db.getSlide(slideId);
    slide.options = await db.getOptionsOf(slide.id);
    return slide;
}

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

router.get("/addOption", async (req, res) => {
    let query = req.query;
    let optionId = getOptionId(req.query);
    if (optionId) {
        resolve(res, db.getOption(optionId));
        return;
    }
    
    resolve(res, db.addOption(getSlideId(query), getOptionText(query), getCorrect(query)));
})

router.get("/updateOption", (req, res) => {
    let query = req.query;
    let data = {
        optionText: getOptionText(query),
        isCorrect: getCorrect(query)
    }
    
    resolve(res, db.updateOption(getOptionId(query), data));
})

router.get("/deleteOption", (req, res) => {
    resolve(res, db.removeOptions(getOptionId(req.query)));
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

function getOptionText(query) {
    return query.optionText ?? query.optiontext ?? query.option;
}

function getOptionId(query) {
    return query.optionId ?? query.optionid ?? query.optionID;
}

function getCorrect(query) {
    return query.isCorrect ?? query.iscorrect ?? query.correct;
}
