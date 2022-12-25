import "express";
import * as db from "../database/userDatabase.mjs";
import { sendError } from "../routes/routeUtils.mjs";

export default async function (req, res, next){
    try {
        const user = await db.getUser(req.user.username);
        const clientId = req.user.clientId;
        req.user = user;
        req.clientId = clientId;
        next();
    }
    catch (error) {
        sendError(res, error);
    }
}