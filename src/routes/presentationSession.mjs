import { Router } from "express";
import * as db from "../database/questionDatabase.mjs";
import * as userDb from "../database/userDatabase.mjs";
import { getGroupId, getPresentationId, sendData, sendError } from "./routeUtils.mjs";
import { v4 as uuid } from "uuid";

var socket;

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
	socket.to(`group_${groupId}`)
	      .emit("newSession", { sessionId: sessionId });
	sendData(res, { sessionId: sessionId });
})

export function presentationSession(socketio) {
	socket = socketio;
	return router;
}