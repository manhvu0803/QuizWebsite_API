import express, { query } from "express";
import * as db from "../database/questionDatabase.mjs";
import { SlideType } from "../define.mjs";
import { resolve, run, getUsername, sendError } from "./routeUtils.mjs";
import { sendCollabEmail } from "../mailer.js";

const router = express.Router();

router.get("/create", async (req, res) => {
    run(res, async () => {
        let result = await db.addPresentation(getPresentationName(req.query), req.user.username);
        await addSlide(result.lastID);
        return { presentationId: result.lastID };
    });
})

router.get("/get", (req, res) => {
    let query = req.query;
    let id = getPresentationId(query) ?? query.id;

    run(res, async () => {
        let presentation = await db.getPresentation(id);
        presentation.slides = await db.getSlidesOf(id);

        return presentation;
    });
})

router.get("/getByCreator", (req, res) => {
    let query = req.query;
    let creator = getUsername(query) ?? query.creator ?? req.user.username;
    resolve(res, db.getPresentationsOf(creator));
})

router.get("getByCollab", (req, res) => {
    let query = req.query;
    let collaborator = getUsername(query) ?? query.collaborator ?? req.user.username;
    resolve(res, db.getPresentationsByCollaborator(collaborator));
})

router.get("/update", (req, res) => {
    let query = req.query;
    let data = {
        name: query.presentationName ?? query.presentationname ?? query.name
    }

    resolve(res, db.updatePresentation(getPresentationId(query) ?? query.id, data));
})

router.get("/delete", (req, res) => {
    resolve(res, db.removePresentation(getPresentationId(req.query) ?? req.query.id));
})

router.get("/addCollaborator", (req, res) => {
    let query = req.query;
    let inviteId = query.inviteId ?? query.inviteid ?? query.inviteID;

    run(res, async () => {
        await db.addInvitedCollaborator(inviteId, req.query.username);
        let presentation = await db.getPresentation(inviteId, "inviteId");
        console.log(presentation);
        return presentation;
    });
})

router.get("/getCollaborator", (req, res) => {
    resolve(res, db.getCollaborators(getPresentationId(req.query)));
})

router.get("/deleteCollaborator", (req, res) => {
    let query = req.query;
    resolve(res, db.removeCollaborator(getPresentationId(query), getUsername(query)));
})

router.get("/addSlide", async (req, res) => {
    let query = req.query;

    run(res, async () => {
        let result = await addSlide(getPresentationId(query), getSlideType(query));
        let slide = await getFullSlide(result.lastID);

        return slide;
    })
})

async function addSlide(presentationId, type = SlideType.MultipleChoice) {
    let result = await db.addSlide(presentationId, "Question", type);

    if (type === SlideType.MultipleChoice) {
        await db.addOption(result.lastID, "Answer 1", true);
        await db.addOption(result.lastID, "Answer 2", false);
    }

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
    let query = req.query;
    let data = {
        question: query.question,
        subtext: query.subtext,
        type: getSlideType(query),
    }

    resolve(res, db.updateSlide(getSlideId(query), data));
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

    run(res, async () => {
        let result = await db.addOption(getSlideId(query), getOptionText(query), getCorrect(query));
        let option = await db.getOption(result.lastID);

        return option;
    });
})

router.get("/updateOption", (req, res) => {
    let query = req.query;
    let data = {
        optionText: getOptionText(query),
        isCorrect: getCorrect(query)
    }

    resolve(res, db.updateOption(getOptionId(query) ?? query.id, data));
})

router.get("/deleteOption", (req, res) => {
    resolve(res, db.removeOptions(getOptionId(req.query) ?? query.id));
})

router.get("/invite", async (req, res) => {
	let query = req.query;

	let receiver = query.receiver;
	let presentId = getPresentationId(query) ?? query.id;

	if (!receiver && !presentId) {
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);
    let presentation = await db.getPresentation(id);

	if (!user) {
		sendError(res, "User doesn't exist!");
        return;
	}

    if(!presentation){
        sendError(res, "Present doesn't exist!");
        return;
    }

	let collabs = await db.getCollaborators(presentId)

	if (collabs.find(({username}) => username === receiver) !== undefined) {
		sendError(res, "User has already be a collaborator!");
		return;
	}

	run(res, async () => {
		await sendInviteEmail({
			toUser: user,
			inviter: req.user.displayName,
			presentname: presentation.name,
			inviteId: presentation.inviteId
		});

		return "Invitation sent";
	})
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

function getSlideType(query) {
    return query.slideType ?? query.slidetype ?? query.type;
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
