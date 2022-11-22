import express from "express";
import * as db from "../database/quizDatabase.mjs";

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;
	let data = {
		name: query.name,
		creator: user(query) ?? query.creator,
		timeCreated: Date.now()
	};

	let result = await run(() => db.addGroup(data));
	res.send(result);
})

router.get("/addUser", async (req, res) => {
	let query = req.query;
	let result = await run(() => db.addGroupMember(group(query), user(query)));
	res.send(result);
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	let result = await run(() => db.removeGroupMember(group(query), user(query)));
	res.send(result);
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	let result = await run(() => db.updateGroup(group(query), user(query), query.isOwner));
	res.send(result);
})

router.get("/createdBy", async (req, res) => {
	let query = req.query;
	let result = await run(() => db.getGroup(user(query), "creator"));
	res.send(result);
})

router.get("/joinedBy", async (req, res) => {
	let query = req.query;
	let result = await run(() => db.getGroup(group(query), user(query), query.isOwner));
	res.send(result);
})

router.get("/inviteUser", async (req, res) => {
	res.send("OK");
})

function group(query) {
	return query.group ?? query.groupname ?? query.groupName;
}

function user(query) {
	return query.user ?? query.username ?? query.userName;
}

async function run(promise) {
	try {
		await promise;
		return { success: true };
	}
	catch (err) {
		return { 
			success: false,
			error: err
		};
	}
}