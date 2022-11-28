export function getGroup(query) {
	return query.group ?? query.groupname ?? query.groupName;
}

export function getUsername(query) {
	return query.user ?? query.username ?? query.userName;
}

export function getClientId(query) {
	return query.clientId ?? query.clientid ?? query.clientID;
}

export async function run(res, promise) {
	try {
		let data = await promise;
        sendData(res, data);
	}
	catch (err) {
        sendError(res, err);
	}
}

export function sendData(res, data) {
    res.status(200).json({ 
        success: true,
        data: data
    });
}

export function sendError(res, err) {
    console.log("Request error:");
    console.log(err);
    res.status(400).json({ 
        success: false,
        error: err.toString()
    });
}
