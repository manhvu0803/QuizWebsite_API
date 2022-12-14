import sqlite from "sqlite3";
// import * as db from "./questionDatabase.mjs"

sqlite.verbose();
const db = new sqlite.Database("database.db");

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
	db.all("", log);
});

// db.close();

// async function func() {
// 	let data = await db.addSlide(1, "hello")
// 	console.log(data);
// };

// func()

function log(err, data) {
	if (err) {
		console.log(err);
	}
	else {
		console.log(data);
	}
}