import express from "express";
import * as db from "../database/quizDatabase.mjs";
import { getGroup, getUsername, run, sendData, sendError } from "./routeUtils.mjs"
import { sendInviteEmail } from "../mailer.js";

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getGroup(query));
	if (group) {
		sendError(res, "Group already exists");
		return;
	}

	await run(res, db.addGroup(getGroup(query) ?? query.name, getUsername(query) ?? query.creator));
})

router.get("/addUser", async (req, res) => {
	let query = req.query;
	let groupMembers = await db.getGroupMembers(getGroup(query));

	for (let member of groupMembers) {
		if (member.username == getUsername(query) || member.email == query.email) {
			sendError(res, "User is already in group");
			return;
		}
	}

	sendData(res, "");
})

router.get("/get", async (req, res) => {
	let query = req.query;
	let groupName = getGroup(query);

	try {
		let group = await db.getGroup(groupName);
		group.members = await db.getGroupMembers(group.name);

		sendData(res, group);
	}
	catch (err) {
		sendError(res, err);
	}
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	await run(res, db.removeGroupMember(getGroup(query), getUsername(query)));
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	await run(res, db.updateGroup(getGroup(query), getUsername(query), query.isOwner));
})

router.get("/createdBy", async (req, res) => {
	await run(res, db.getAllGroup(getUsername(req.query), "creator"));
})

router.get("/joinedBy", async (req, res) => {
	let query = req.query;
	await run(res, db.getGroupsUserIn(getUsername(query)));
})

router.get("/invite", async (req, res) => {
	let query = req.query;

	let sender = query.sender;
	let reciver = query.reciver;
	let groupName = getGroup(query);

	if(!sender && !reciver && !groupName){
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(reciver);

	if(!user){
		sendError(res, "User doesn't exist!");
        return;
	}

	try {
		let members = await db.getGroupMembers(groupName);

		if(members.find(({username}) => username === reciver) !== undefined){
			sendError(res, "User joined group!");
			return;
		}

		await sendInviteEmail({toUser: {email: user.email, username: user.username}, inviter: sender, groupname: groupName});

		sendData(res, "Invitation send!");

	}
	catch (err) {
		sendError(res, err);
	}



	await run(res, db.getGroupsUserIn(getUsername(query)));
})

export default router;