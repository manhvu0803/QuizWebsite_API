import express from "express";
import * as db from "../database/userDatabase.mjs";
import { getInviteId, getUsername, resolve, run, sendData, sendError } from "./routeUtils.mjs"
import { sendInviteEmail } from "../mailer.js";

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getGroupName(query));
	if (group) {
		sendError(res, "Group already exists");
		return;
	}

	resolve(res, db.addGroup(getGroupName(query) ?? query.name, getUsername(query) ?? req.user.username));
})

router.get("/addUser", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getInviteId(query), "inviteId");

	if (!group) {
		sendError(res, "Inivte ID doesn't exist");
		return;
	}

	let groupMembers = await db.getGroupMembers(group.name);

	const user = req.user;

	let currentUsername = user.username;
	for (let member of groupMembers) {
		if (member.username == currentUsername || member.email == user.email) {
			sendError(res, "User is already in group");
			return;
		}
	}

	resolve(res, db.addGroupMember(group.name, currentUsername));
})

router.get("/get", async (req, res) => {
	let query = req.query;
	let groupId = getGroupId(query);

	run(res, async () => {
		let group = await db.getGroup(groupId);
		group.creator = await db.getUser(group.creator);
		delete group.creator.password;
		group.members = await db.getGroupMembers(group.name);

		return group;
	});
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.removeGroupMember(getGroupId(query), getUsername(query)));
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.updateGroupMember(getGroupId(query), getUsername(query), query.role));
})

router.get("/createdBy", async (req, res) => {
	let groups = await db.getAllGroup(req.user.username, "creator");
	sendGroupData(res, groups);
})

router.get("/joinedBy", async (req, res) => {
	let groups = await db.getGroupsUserIn(req.user.username);
	sendGroupData(res, groups);
})

function sendGroupData(res, groups)
{
	return run(res, async () => {
		for (let group of groups) {
			group.creator = await db.getUser(group.creator);
			delete group.creator.password;
			delete group.creator.username;
		}

		return groups;
	});
}

router.get("/invite", async (req, res) => {
	let query = req.query;

	let sender = query.sender;
	let receiver = query.receiver;
	let inviteId = query.inviteId;
	let groupId = getGroupId(query);

	if(!sender && !receiver && !groupId){
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);

	if(!user){
		sendError(res, "User doesn't exist!");
        return;
	}

	try {
		let members = await db.getGroupMembers(groupId);

		if(members.find(({username}) => username === receiver) !== undefined){
			sendError(res, "User joined group!");
			return;
		}

		await sendInviteEmail({
			toUser: { email: user.email, username: user.username }, 
			inviter: sender, 
			groupname: groupId, 
			inviteId: inviteId
		});

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

function getGroupName(query) {
	return query.group ?? query.groupname ?? query.groupName;
}