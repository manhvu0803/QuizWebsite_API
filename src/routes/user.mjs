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
    let user = req.user;

    let data = {
        displayName: user.displayName,
        age: user.age,
        email: user.email,
        avatarUrl: user.avatarUrl
    }

    resolve(res, db.updateUser(getUsername(query), data));
})

router.get("/logout", async (req, res) => {

    let clientId = getClientId(req.clientId);

    if (!clientId) {
        sendError(res, "No client ID");
        return;
    }

    resolve(res, db.removeToken(req.clientId, "clientId"));
})

router.get("/test", (req, res) => {
    console.log(req.user);
    res.status(200).json({success: true, test: req.user});
})

export default router;