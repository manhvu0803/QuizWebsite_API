import express from "express";
import * as db from "../database/quizDatabase.mjs";

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;
	await run(res, db.addGroup(group(query) ?? query.name, user(query) ?? query.creator));
})

router.get("/addUser", async (req, res) => {
	let query = req.query;
	await run(res, db.addGroupMember(group(query), user(query)));
})

router.get("/kickUser", async (req, res) => {
	let query = req.query;
	await run(res, db.removeGroupMember(group(query), user(query)));
})

router.get("/updateUser", async (req, res) => {
	let query = req.query;
	await run(res, db.updateGroup(group(query), user(query), query.isOwner));
})

router.get("/createdBy", async (req, res) => {
	await run(res, db.getGroup(user(req.query), "creator"));
})

router.get("/joinedBy", async (req, res) => {
	let query = req.query;
	await run(res, db.getGroup(group(query), user(query), query.isOwner));
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

async function run(res, promise) {
	try {
		let data = await promise;
		res.status(200).json({ 
			success: true,
			data: data
		});
	}
	catch (err) {
		console.log(err);
		res.status(400).json({ 
			success: false,
			error: err.toString()
		});
	}
}

export default router;