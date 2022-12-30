import { Router } from "express";
import * as db from "../database/questionDatabase.mjs";
import * as userDb from "../database/userDatabase.mjs";
import { getGroupId, getPresentationId, getOptionId, sendData, sendError, resolve } from "./routeUtils.mjs";
import { v4 as uuid } from "uuid";

var socketIo;

var router = Router();

var sessionMap = new Map();

router.get("/startPresentation/public", async (req, res) => {
	let presentationId = getPresentationId(req.query);

	let presentation = await db.getPresentation(presentationId);
	if (!presentation) {
		sendError(res, "Presentation doesn't exist");
		return;
	}

	let sessionId = uuid();
	sessionMap.set(sessionId, presentation.id);
	sendData(res, { sessionId: sessionId });
})

router.get("/startPresentation/group", async (req, res) => {
	let presentationId = getPresentationId(req.query);
	let groupId = getGroupId(req.query);

	let [presentation, group] = await Promise.all([
		db.getPresentation(presentationId),
		userDb.getGroup(groupId)
	]);

	if (!presentation) {
		sendError(res, "Presentation doesn't exist");
		return;
	}

	if (!group) {
		sendError(res, "Group doesn't exist");
		return;
	}

	let sessionId = uuid();
	sessionMap.set(sessionId, { presentationId: presentation.id, groupId: group.id });
	socketIo.to(`group_${groupId}`)
	        .emit("newSession", { sessionId: sessionId });
	sendData(res, { sessionId: sessionId });
})

router.get("/data", (req, res) => {
	sendData(res, sessionMap.get(req.query.sessionId));
})

router.get("/moveToSlide", (req, res) => {
	let session = sessionMap.get(req.query.sessionId);
	session.slideId = req.query.slideId;

	socketIo.to(`group_${session.groupId}`).emit("moveToSlide", { slideId: session.slideId });

	sendData(res, { success: true });
})

router.get("/answer", async (req, res) => {
    let option = await db.getOption(getOptionId(req.query));
    if (!option) {
        sendError(res, "Option doesn't exists");
        return;
    }

    run(res, async () => {
        let addPromise = db.addAnswer(req.user.username, option.id);
        socketIo.emit(`/slide/${option.slideId}`);
        
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
        socketIo.emit(`/slide/${option.slideId}`);
        
        return addPromise;
    });
})

router.get("/addComment", async (req, res) => {
	let query = req.query;
	let result = await db.addComment(query.presentationId, query.username, query.comment ?? query.commentText, query.type);

	socketIo.of(`/presentation/${query.presentationId}`)
	        .emit("newComment", { commentId: result.lastID });

	sendData(res, result);
})

router.get("/answerQuestion", async (req, res) => {
	let query = req.query;
	let commentId = getCommentId(query);
	let result = await db.answerQuestion(commentId, query.answerText ?? query.answer);
	let comment = await db.getComment(commentId);

	socketIo.of(`/presentation/${comment.presentationId}`)
	        .emit("updateAnswer", { commentId: result.lastID });

	sendData(res, result);
})

router.get("/getComment", (req, res) => {
	let query = req.query;
	resolve(res, db.getComment());
});

router.get("/getCommentsOf", (req, res) => {
	resolve(res, db.getCommentsOf(getPresentationId(req.query)));
});

export function setup(socketio) {
	socketIo = socketio;
	return router;
}

function getCommentId(query) {
	return query.commentId ?? query.commentid ?? query.comment ?? query.id;
}