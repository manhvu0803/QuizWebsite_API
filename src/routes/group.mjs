import express from "express";
import * as db from "../database/quizDatabase.mjs";
import { getGroup, getUsername, run } from "./routeUtils.mjs"

const router = express.Router();

router.get("/create", async (req, res) => {
	let query = req.query;
	await run(res, db.addGroup(getGroup(query) ?? query.name, getUsername(query) ?? query.creator));
})

router.get("/addUser", async (req, res) => {
	let query = req.query;
	await run(res, db.addGroupMember(getGroup(query), getUsername(query)));
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
	await run(res, db.getGroup(getUsername(req.query), "creator"));
})

router.get("/joinedBy", async (req, res) => {
	let query = req.query;
	await run(res, db.getGroup(getGroup(query), getUsername(query), query.isOwner));
})

router.get("/inviteUser", async (req, res) => {
	res.send("OK");
})

export default router;