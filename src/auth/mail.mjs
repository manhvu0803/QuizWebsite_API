import * as db from "../database/userDatabase.mjs";
import { sendError } from "../routes/routeUtils.mjs";

export default async function validateEmail(req, res, next){
    let query = req.query;

	let receiver = query.receiver;

	if (!receiver) {
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);

	if (!user) {
		sendError(res, "User doesn't exist!");
        return;
	}
	else{
		req.receiver = user;
		next();
	}
}