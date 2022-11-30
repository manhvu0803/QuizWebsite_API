import express from "express";
import * as db from "../database/quizDatabase.mjs";
import jwt from "jsonwebtoken";
import "dotenv/config"
import { getClientId, getUsername, sendData, sendError, run, getAvatarUrl } from "./routeUtils.mjs"
import { sendConfirmationEmail } from "../mailer.js";


const router = express.Router();

router.get("/register", async (req, res) => {
    let query = req.query;
    let error = null;
    let username = getUsername(query);

    let user = await db.getUser(username);
    if (user) {
        error = "Username has been used";
    }
    error = null;

    user = await db.getUser(query.email, "email");
    if (user) {
        error = "Email has been used";
    }

    if (error) {
        sendError(res, error);
        return;
    }

    try {
        await db.addUser({
            email: query.email,
            username: username,
            password: query.password,
            active: 0
        });

        let clientId = getClientId(query);
        let token = await db.getToken(clientId, "clientId");

        if (!token) {
            token = random();
        }

        await db.addToken(token, clientId, username);

        await sendConfirmationEmail({toUser: {email: query.email, username: username}, hash: token});

        sendData(res, { token });
    }
    catch (err) {
        sendError(res, err);
    }
});

function random(min = 1000000000, max = 10000000000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

router.get("/login", async (req, res) => {
    let query = req.query;
    let token = query.token ?? query.accessToken;

    let user = null;

    if (token) {
        let tokenInfo = await db.getToken(token);
        user = await db.getUser(tokenInfo.user);

        console.log(user);

        if (user && user.active === 1) {
            sendData(res, {
                accessToken: jwt.sign({
                        username: user.username,
                        email: user.email,
                        displayName: user.displayName,
                        age: user.age,
                        avatarUrl: user.avatarUrl
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                )
            });
            return;
        }
        else if (user){
            res.status(400).json({
                success: false,
                isActive: false
            })
            return;
        }
    }

    let username = getUsername(query);
    if (username) {
        user = await db.getUser(username);
    }

    if (!user && query.email) {
        user = await db.getUser(query.email, "email");
    }

    if (!user) {
        sendError(res, "User doesn't exist");
        return;
    }

    if(user.active === 0){
        res.status(400).json({
            success: false,
            isActive: false
        })
        return;
    }

    if (user.password != query.password) {
        sendError(res, "Wrong password");
        return;
    }

    let clientId = getClientId(query);

    if (!clientId) {
        sendError(res, "No client ID");
        return;
    }

    token = await db.getToken(getClientId(query), "clientId");

    if (!token) {
        token = {
            accessToken: random(),
            clientId: clientId
        }

        await db.addToken(token.accessToken, clientId, username);
    }

    sendData(res, {accessToken: jwt.sign({ name: user?.username, avatar:"" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    }) });
});

router.get("/edit", (req, res) => {
    let query = req.query;

    let data = {
        displayName: query.displayName,
        age: query.age,
        email: query.email,
        avatarUrl: getAvatarUrl(query)
    }

    run(res, db.updateUser(query.username, data));
})

router.get("/active", async (req, res) => {
    let query = req.query;

    run(res, db.updateUser(query.username, {active: 1}));
})

export default router;