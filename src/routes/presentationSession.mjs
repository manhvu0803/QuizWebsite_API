import { Router } from "express";
import * as db from "../database/questionDatabase.mjs";
import * as userDb from "../database/userDatabase.mjs";
import { getGroupId, getPresentationId, getOptionId, sendData, sendError, resolve } from "./routeUtils.mjs";
import { v4 as uuid } from "uuid";

var socketIo;

var router = Router();

const sessionMap = new Map();

const groupMap = new Map();

const presentationMap = new Map();

router.get("/startPresentation/public", async (req, res) => {
	let presentationId = getPresentationId(req.query);

	let presentation = await db.getPresentation(presentationId);
	if (!presentation) {
		sendError(res, "Presentation doesn't exist");
		return;
	}

	let sessionId = newSession(presentation.id, req.user.username, null);
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

	let sessionId = newSession(presentation.id, req.user.username, group.id);
	socketIo.to(`group_${groupId}`)
	        .emit("newSession", { sessionId: sessionId });
	sendData(res, { sessionId: sessionId });
})

router.get("/data", (req, res) => {
	let session = sessionMap.get(req.query.sessionId);
	if (userDb.getMember(req.user.username, session.groupId)) {
		sendData(res, session);
	}
	else {
		sendError(res, "User is not in the right group");
	}
})

router.get("/moveToSlide", (req, res) => {
	let session = sessionMap.get(req.query.sessionId);
	session.slideId = req.query.slideId;

	socketIo.to(`group_${session.groupId}`)
	        .emit("moveToSlide", { currentSlideId: session.slideId });

	sendData(res, { success: true });
})

router.get("/endPresentation", (req, res) => {
	let query = req.query;
	endSession(query.presentationId ?? query.sessionId);
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
	let commentId = getCommentId(query) ?? query.id;

	if (Array.isArray(commentId)) {
		resolve(res, db.getComments(commentId));
	}
	else {
		resolve(res, db.getComment(commentId));
	}
});

router.get("/getCommentsOf", (req, res) => {
	resolve(res, db.getCommentsOf(getPresentationId(req.query)));
});

export function setup(socketio) {
	socketIo = socketio;
	return router;
}

export function getSessionByGroup(groupId) {
	return sessionMap.get(groupMap.get(groupId));
}

function getCommentId(query) {
	return query.commentId ?? query.commentid ?? query.comment ?? query.id;
}

function newSession(presentationId, presenter, groupId) {
	let sessionId = uuid();
	let sessionData = { presentationId, presenter, groupId };
	sessionData.currentSlideId = null;
	sessionMap.set(sessionId, sessionData);
	presentationMap.set(presentationId, sessionId);

	if (groupId) {
		groupMap.set(groupId, sessionId);
	}

	return sessionId;
}

function endSession(presentationIdOrSessionId) {
	let session = sessionMap.get(presentationIdOrSessionId) ?? presentationMap.get(presentationIdOrSessionId);
	sessionMap.delete(session.id);
	presentationMap.delete(session.presentationId);
	groupMap.delete(session.groupId);
}