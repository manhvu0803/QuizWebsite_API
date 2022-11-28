import express from "express";
import * as db from "../database/quizDatabase.mjs";
import { getUsername, sendData, sendError } from "./routeUtils.mjs"

const router = express.Router();

router.get("/register", async (req, res) => {
    let query = req.query;
    let error = null;
    let username = getUsername(query);

    let user = await db.getUser(username);
    if (user) {
        error = "Username has been used";
    }
    ror = null;
    
    user = await db.getUser(query.email, "email");
    if (user) {
        error = "Username has been used";
    }

    if (error) {
        sendError(res, err);
        return;
    }

    try {
        await db.addUser({ 
            email: query.email, 
            username: username, 
            password: query.password 
        });

        let token = random();
        await db.addToken(token, query.clintId);

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
    let username = getUsername(query);
    let token = query.token ?? query.accessToken;

    let user = null;

    if (token) {
        tokenInfo = await db.getToken(token);
        user = await db.getUser(tokenInfo.user);

        if (user) {
            sendData(res, user);
            return;
        }
    }

    if (username) {
        user = await db.getUser(username);
    }

    if (!user && query.email) {
        user = await db.getUser(query.email, "email");
    }

    if (!user) {
        sendError(res, "User doesn't exist");
    }
    
    if (user.password != query.password) {
        sendError(res, "Wrong password");
    }
    
    sendData(res, user);
});