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

router.get("/presentation/start/public", async (req, res) => {
	let presentationId = getPresentationId(req.query);

	let presentation = await db.getPresentation(presentationId);
	if (!presentation) {
		sendError(res, "Presentation doesn't exist");
		return;
	}

	let sessionId = newSession(presentation.id, req.user.username, null);
	sendData(res, { sessionId: sessionId });
})

router.get("/presentation/start/group", async (req, res) => {
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

	if (!session) {
		sendError(res, "Session doesn't exist");
		return;
	}

	if (userDb.getMember(req.user.username, session.groupId)) {
		sendData(res, session);
	}
	else {
		sendError(res, "User is not in the right group");
	}
})

router.get("/presentation/move", (req, res) => {
	let query = req.query;
	let session = sessionMap.get(req.query.sessionId);

	session.currentSlideId = query.slideId;
	session.currentSlideIndex = query.slideIndex ?? query.index;

	socketIo.emit(`/presentation/${session.presentationId}/moveToSlide`, { 
		currentSlideId: session.currentSlideId, 
		currentSlideIndex: session.currentSlideIndex
	});

	sendData(res, { success: true });
})

router.get("/presentation/end", (req, res) => {
	let query = req.query;
	endSession(query.presentationId ?? query.sessionId);
	socketIo.emit(`/presentation/${query.presentationId}/end`);
	sendData(res, { success: true });
})

router.get("/option/choose", async (req, res) => {
	let option = await db.getOption(getOptionId(req.query));
	if (!option) {
		sendError(res, "Option doesn't exists");
		return;
	}

	run(res, async () => {
		let result = await db.addAnswer(req.user.username, option.id);
		socketIo.emit(`/presentation/${query.presentationId}/newResult`, { answerId: result.lastID });

		return result;
	});
})

router.get("/option/removeChosen", async (req, res) => {
	let option = db.getOption(req.query.optionId);
	if (!option) {
		sendError(res, "Option doesn't exists");
		return;
	}

	run(res, async () => {
		let addPromise = db.removeAnswer(req.user.username, option.id);
		socketIo.emit(`/presentation/${query.presentationId}/newResult`, { optionId: option.id });
				
		return addPromise;
	});
})

router.get("/option/answer/data", (req, res) => {
	resolve(res, db.getAnswer(req.user.username, req.query.optionId));
})

router.get("/comment/add", async (req, res) => {
	let query = req.query;
	let result = await db.addComment(query.presentationId, req.user.username, query.comment ?? query.commentText, query.type);

	socketIo.emit(`/presentation/${query.presentationId}/newComment`, { commentId: result.lastID });

	sendData(res, result);
})

router.get("/comment/answer", async (req, res) => {
	let query = req.query;
	let commentId = getCommentId(query);
	let result = await db.answerQuestion(commentId, query.answerText ?? query.answer);
	let comment = await db.getComment(commentId);

	socketIo.emit(`/presentation/${query.presentationId}/updateAnswer`, { commentId: result.lastID });

	sendData(res, result);
})

router.get("/comment/data", (req, res) => {
	let query = req.query;
	let commentId = getCommentId(query) ?? query.id;

	if (Array.isArray(commentId)) {
		resolve(res, db.getComments(commentId, query.type, req.user.username));
	}
	else {
		resolve(res, db.getComment(commentId, query.type, req.user.username));
	}
});

router.get("/comment/of", (req, res) => {
	resolve(res, db.getCommentsOf(getPresentationId(req.query)));
});

router.get("/comment/upvote", (req, res) => {
	resolve(res, db.upvote(req.query.commentId, req.user.username))
})

router.get("/comment/unvote", (req, res) => {
	resolve(res, db.unvote(req.query.commentId, req.user.username))
})

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
	let sessionData = { 
		presentationId, 
		presenter, 
		groupId,
		currentSlideId: null,
		currentSlideIndex: 0
	};
	
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