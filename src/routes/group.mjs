import express from "express";
import * as db from "../database/userDatabase.mjs";
import { getInviteId, getGroupId, getUsername, resolve, run, sendError } from "./routeUtils.mjs"
import { sendInviteEmail } from "../mailer.js";
import { getSessionByGroup } from "./presentationSession.mjs";

const router = express.Router();

//#region group
router.get("/create", async (req, res) => {
	resolve(res, db.addGroup(getGroupName(req.query), req.user.username));
})

router.get("/get", async (req, res) => {
	let query = req.query;
	let groupId = getGroupId(query) ?? query.id;
	let group = await db.getGroup(groupId);

	if (!group) {
		sendError(res, "Group doesn't exist")
		return;
	}

	run(res, async () => {
		group.creator = await db.getUser(group.creator);
		delete group.creator.password;
		group.members = await db.getGroupMembers(group.id);
		group.currentSession = getSessionByGroup(group.id);

		return group;
	});
})

router.get("/delete", (req, res) => {
	resolve(res, db.deleteGroup(getGroupId(req.query)));
})
//#endregion

router.get("/getMember", (req, res) => {
	let username = req.query.username ?? req.user.username;
	resolve(res, db.getMember(username, getGroupId(req.query)));
})

//#region user
router.get("/addUser", async (req, res) => {
	let query = req.query;

	let group = await db.getGroup(getInviteId(query), "inviteId");

	if (!group) {
		sendError(res, "Inivte ID doesn't exist");
		return;
	}

	let groupMembers = await db.getGroupMembers(group.id);
	let user = req.user;

	if (groupMembers.find(member => member.username == user.username)) {
		sendError(res, "User is already in group");
		return;
	}

	run(res, async () => {
		await db.addGroupMember(group.id, user.username);
		return group;
	});
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.removeGroupMember(getGroupId(query) ?? query.id, getUsername(query)));
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	await resolve(res, db.updateGroupMember(getGroupId(query) ?? query.id, getUsername(query), query.role));
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
		await db.addCreatorData(groups);
		return groups;
	});
}

router.get("/invite", async (req, res) => {
	let query = req.query;

	let sender = query.sender;
	let receiver = query.receiver;
	let groupId = getGroupId(query) ?? query.id;

	if (!sender && !receiver && !groupId) {
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);
	let senderData = await db.getUser(sender);

	if (!user) {
		sendError(res, "User doesn't exist!");
        return;
	}

	let group = await db.getGroup(groupId);

	if(!group){
		sendError(res, "Group doesn't exist!");
        return;
	}

	let members = await db.getGroupMembers(groupId);

	if (members.find(({username}) => username === receiver) !== undefined) {
		sendError(res, "User has already joined group!");
		return;
	}

	run(res, async () => {
		await sendInviteEmail({
			toUser: { email: user.email, username: user.username },
			inviter: senderData.displayName,
			groupname: group.name,
			inviteId: group.inviteId
		});

		return "Invitation sent";
	})
})
//#endregion

export default router;

function getGroupName(query) {
	return query.group ?? query.groupname ?? query.groupName ?? query.name;
}
