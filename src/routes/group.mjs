import express from "express";
import * as db from "../database/userDatabase.mjs";
import { getGroupName, getInviteId, getUsername, resolve, sendData, sendError } from "./routeUtils.mjs"
import { sendInviteEmail } from "../mailer.js";

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getGroupName(query));
	if (group) {
		sendError(res, "Group already exists");
		return;
	}

	resolve(res, db.addGroup(getGroupName(query) ?? query.name, getUsername(query) ?? query.creator));
})

router.get("/addUser", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getInviteId(query), "inviteId");

	if (!group) {
		sendError(res, "Inivte ID doesn't exist");
		return;
	}

	let groupMembers = await db.getGroupMembers(group.name);

	let currentUsername = getUsername(query);
	for (let member of groupMembers) {
		if (member.username == currentUsername || member.email == query.email) {
			sendError(res, "User is already in group");
			return;
		}
	}

	try {
		await db.addGroupMember(group.name, currentUsername);
		sendData(res, group);
	}
	catch (error) {
		sendError(res, error);
	}
})

router.get("/get", async (req, res) => {
	let query = req.query;
	let groupName = getGroupName(query);

	try {
		let group = await db.getGroup(groupName);
		group.creator = await db.getUser(group.creator);
		delete group.creator.password;
		group.members = await db.getGroupMembers(group.name);

		sendData(res, group);
	}
	catch (err) {
		sendError(res, err);
	}
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.removeGroupMember(getGroupName(query), getUsername(query)));
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.updateGroupMember(getGroupName(query), getUsername(query), query.role));
})

router.get("/createdBy", async (req, res) => {
	let groups = await db.getAllGroup(req.user.username, "creator");
	sendGroupData(res, groups)
})

router.get("/joinedBy", async (req, res) => {
	let groups = await db.getGroupsUserIn(req.user.username);
	sendGroupData(res, groups);
})

async function sendGroupData(res, groups)
{
	try {
		for (let group of groups) {
			group.creator = await db.getUser(group.creator);
			delete group.creator.password;
			delete group.creator.username;
		}

		sendData(res, groups);
	}
	catch (error) {
		sendError(res, error);
	}
}

router.get("/invite", async (req, res) => {
	let query = req.query;

	let sender = query.sender;
	let receiver = query.receiver;
	let inviteId = query.inviteId;
	let groupName = getGroupName(query);

	if(!sender && !receiver && !groupName){
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);

	if(!user){
		sendError(res, "User doesn't exist!");
        return;
	}

	try {
		let members = await db.getGroupMembers(groupName);

		if(members.find(({username}) => username === receiver) !== undefined){
			sendError(res, "User joined group!");
			return;
		}

		await sendInviteEmail({toUser: {email: user.email, username: user.username}, inviter: sender, groupname: groupName, inviteId: inviteId});

		sendData(res, "Invitation send!");

	}
	catch (err) {
		sendError(res, err);
		return;
	}
})

router.get("/test", (req, res) => {
    console.log(req.user);
    res.status(200).json(req.user);
})

export default router;
