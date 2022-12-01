import express from "express"
import OAuth2Server, { Request, Response } from "@node-oauth/oauth2-server";
import model from "./model.mjs"

const app = express();
const port = 8000;

app.oauth = new OAuth2Server({
	model: model,
	grants: ["password"]
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/*", (req, res) => {
	console.log(req.url);
	res.sendStatus(200);
});

app.post("/login", async (req, res) => {
	try {
		let token = await app.oauth.token(new Request(req), new Response(res));
		console.log("token:");
		console.log(token);
		res.send(token);
	}
	catch (err) {
		// console.log("Error " + err);
		// res.send(err);
		throw err;
	}
});

app.post("/secret", async (req, res) => {
	try {
		let result = await app.oauth.authenticate(new Request(req), new Response(res));
		console.log("secret:");
		console.log(result);
		res.send(result);
	}
	catch (err) {
		throw err;
	}
});

app.listen(port, () => console.log("Listening on port " + port));