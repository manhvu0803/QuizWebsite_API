import * as db from "./database/quizDatabase.mjs";

export default {
	getAccessToken: async (accessToken) => {
		return db.getToken(accessToken);
	},

	getUser: async (username, password) => {
		let data = await db.getUser(username);
		console.log(data);
		return db.getUser(username);
	},

	saveToken: async (token, client, user) => {
		await db.setUser(user.username, client.id, token);
		return token;
	},

	getClient: (clientId, clientSecret) => {
		return { id: clientId, grants: ["password"] };
	}
}