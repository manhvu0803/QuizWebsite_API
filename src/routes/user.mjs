import express from "express";
import * as db from "../database/userDatabase.mjs";
import "dotenv/config"
import { getClientId, getUsername, sendData, sendError, resolve, getAvatarUrl, getDisplayName } from "./routeUtils.mjs"

const router = express.Router();

router.get("/get", async (req, res) => {
    let user = req.user;
    delete user.password;
    console.log(user);
    sendData(res, user);
})

router.get("/edit", (req, res) => {
    let query = req.query;

    let data = {
        displayName: getDisplayName(query),
        age: query.age,
        email: query.email,
        avatarUrl: getAvatarUrl(query)
    }

    resolve(res, db.updateUser(getUsername(query), data));
})

router.get("/logout", async (req, res) => {
    let query = req.query;

    let clientId = getClientId(query);

    if (!clientId) {
        sendError(res, "No client ID");
        return;
    }

    resolve(res, db.removeToken(req.user.clientId, "clientId"));
})

router.get("/test", (req, res) => {
    console.log(req.user);
    res.status(200).json({success: true, test: req.user});
})

export default router;