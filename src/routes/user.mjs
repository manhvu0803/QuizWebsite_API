import express from "express";
import * as db from "../database/userDatabase.mjs";
import "dotenv/config"
import { sendData, sendError, resolve, getAvatarUrl, getDisplayName } from "./routeUtils.mjs"
import { sendConfirmationEmail } from "../mailer.js";

const router = express.Router();

router.get("/get", async (req, res) => {
    let user = req.user;
    delete user.password;
    console.log(user);
    sendData(res, user);
})

router.get("/edit", async (req, res) => {
    let user = req.user;
    let query = req.query;

    const active = query.email == user.email ? 1 : 0;

    let data = {
        displayName: getDisplayName(query),
        age: query.age,
        email: query.email,
        avatarUrl: getAvatarUrl(query),
        active: active,
        password: query.password
    }

    if (active === 0) {
        await sendConfirmationEmail({toUser: {email: query.email, username: user.username}, hash: null});
    }

    resolve(res, db.updateUser(user.username, data));
})

router.get("/logout", async (req, res) => {
    let clientId = req.clientId;

    if (!clientId) {
        sendError(res, "No client ID");
        return;
    }

    resolve(res, db.removeToken(req.clientId, "clientId"));
})

router.get("/checkPassword", async (req, res) => {
    res.send({ isCorrect: req.query.password == req.user.password });
})

router.get("/test", (req, res) => {
    console.log(req.user);
    res.status(200).json({success: true, test: req.user});
})

export default router;
