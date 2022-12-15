import express, { query } from "express";
import * as db from "../database/questionDatabase.mjs";
import { sendData, sendError, resolve, run, getUsername, getGroupId } from "./routeUtils.mjs";

const router = express.Router();

router.get("/create", async (req, res) => {
    run(res, async () => {
        let result = await db.addPresentation(getPresentationName(req.query), getGroupId(req.query). req.user.username);
        await addSlide(result.lastID);
        return { presentationId: result.lastID };
    });
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
        resolve(res, db.getPresentationsOf(req.user.username));
    }
})

router.get("/update", (req, res) => {
    let query = req.query;
    let data = {
        name: query.presentationName ?? query.presentationname ?? query.name,
        groupId: getGroupId(query)
    }

    resolve(res, db.updatePresentation(getPresentationId(query) ?? query.id, data));
})

router.get("/delete", (req, res) => {
    resolve(res, db.removePresentation(getPresentationId(req.query) ?? req.query.id));
})

router.get("/addSlide", async (req, res) => {
    run(res, async () => {
        let result = await addSlide(getPresentationId(req.query));
        let slide = await getFullSlide(result.lastID);

        return slide;
    })
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
        resolve(res, getFullSlide(slideId));
        return;
    }

    resolve(res, db.getSlidesOf(getPresentationId(req.query)));
})

async function getFullSlide(slideId) {
    let slide = await db.getSlide(slideId);

    if (!slide) {
        throw new Error(`Slide ID ${slideId} doesn't exists`);
    }

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
