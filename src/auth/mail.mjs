import * as db from "../database/userDatabase.mjs";

export default async function validateEmail(req, res, next){
    let query = req.query;

	let receiver = query.receiver;
	let presentId = getPresentationId(query) ?? query.id;

	if (!receiver && !presentId) {
		sendError(res, "Missing data!");
        return;
	}

	let user = await db.getUser(receiver);
    let presentation = await db.getPresentation(id);

	if (!user) {
		sendError(res, "User doesn't exist!");
        return;
	}

    if(!presentation){
        sendError(res, "Present doesn't exist!");
        return;
    }

    req.receiver = user;
    req.presentation = presentation;

    next();
}