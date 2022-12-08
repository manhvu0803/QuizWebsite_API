import sqlite from "sqlite3";
import * as db from "./questionDatabase.mjs"

// sqlite.verbose();
// const db = new sqlite.Database("database.db");

// db.serialize(() => {
//     db.run("PRAGMA foreign_keys = ON");

// 	// db.all("SELECT * FROM user", (err, rows) => console.log(rows));
// 	// db.all("SELECT * FROM quiz", (err, rows) => console.log(rows));
// 	// db.all("SELECT * FROM question", (err, rows) => console.log(rows));

// 	// db.all(`SELECT * FROM user WHERE user.username = 'guest'`, (err, rows) => console.log(rows));
	
// 	db.run("INSERT INTO slide (presentationId, question) VALUES (1, 'hallow')", function (err) { console.log(this) });
// 	db.all(`SELECT * FROM slide`, (err, rows) => console.log(rows));
// });

// // db.close();

async function func() {
	let data = await db.addSlide(1, "hello")
	console.log(data);
};

func()