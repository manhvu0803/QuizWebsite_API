import sqlite from "sqlite3";
// import * as db from "./questionDatabase.mjs"

sqlite.verbose();
const db = new sqlite.Database("database.db");

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
	db.all(`SELECT p.* FROM
	presentation p JOIN collaborator c ON p.id = c.presentationId
	WHERE c.user = (?)`, "guest", log);
});

// // db.close();

// async function func() {
// 	let data = await db.getCollaborators(2);
// 	console.log(data);
// };

// func()

function log(err, data) {
	if (err) {
		console.log(err);
	}
	else if (data) {
		console.log(data);
	}
	else {
		console.log(this);
	}
}