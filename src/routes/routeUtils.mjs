export function getGroupName(query) {
	return query.group ?? query.groupname ?? query.groupName;
}

export function getUsername(query) {
	return query.user ?? query.username ?? query.userName;
}

export function getDisplayName(query) {
	return query.displayName ?? query.displayname;
}

export function getClientId(query) {
	return query.clientId ?? query.clientid ?? query.clientID;
}

export function getAvatarUrl(query) {
	return query.avatar ?? query.avatrUrl ?? query.avatarURL ?? query.avatarurl;
}

export function getInviteId(query) {
	return query.inviteId ?? query.inviteid ?? query.inviteID;
}

export async function resolve(res, promise) {
	try {
		let data = await promise;
        sendData(res, data);
	}
	catch (err) {
        sendError(res, err);
	}
}

export async function run(res, callback) {
	try {
		let data = await callback();
        sendData(res, data);
	}
	catch (err) {
        sendError(res, err);
	}
}

export function sendData(res, data) {
    res.status(200).json(data);
}

export function sendError(res, error) {
    console.trace("Request error:");
    console.log(error);
    res.status(400).json({ error: `${error}` });
}
