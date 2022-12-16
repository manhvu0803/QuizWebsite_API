const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

function log(err, data)
{
	if (err) {
		console.log(err);
	}
	else {
		console.log(data);
	}
}

db.serialize(() => {
	db.run("PRAGMA foreign_keys = ON");
	
	db.run(`CREATE TABLE userGroup (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		creator TEXT,
		timeCreated INTEGER,
		inviteId TEXT UNIQUE,

		FOREIGN KEY (creator) REFERENCES user (username)
	)`, (err) => log(err, "Created table userGroup"));

	db.run(`CREATE TABLE user (
		username TEXT PRIMARY KEY,
		password TEXT,
		email TEXT NOT NULL UNIQUE,
		displayName TEXT,
		age INTEGER,
		avatarUrl TEXT,
		type INTEGER,
		active INTEGER
	)`, log);

	db.run(`CREATE TABLE groupMember (
		groupId INTEGER,
		user TEXT,
		timeJoined INTEGER,
		role INTEGER,

		PRIMARY KEY (groupId, user),
		FOREIGN KEY (groupId) REFERENCES userGroup (id),
		FOREIGN KEY (user) REFERENCES user (username)
	)`, log);

	db.run(`CREATE TABLE token (
		accessToken TEXT PRIMARY KEY,
		clientId TEXT UNIQUE,
		user TEXT,

		FOREIGN KEY (user) REFERENCES user (username)
	)`, log)

	db.run(`CREATE TABLE presentation (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		creator TEXT,
		timeCreated INTEGER,

		UNIQUE (name, creator),
		FOREIGN KEY (creator) REFERENCES user (username)
	)`, log);

	db.run(`CREATE TABLE slide (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		presentationId INTEGER,
		question TEXT,
		type INTEGER NOT NULL,

		FOREIGN KEY (presentationId) REFERENCES presentation (id)
	)`, log);

	db.run(`CREATE TABLE option (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		slideId INTEGER,
		optionText TEXT,
		isCorrect INTEGER,

		FOREIGN KEY (slideId) REFERENCES slide (id)
	)`, log);

	db.run(`CREATE TABLE answer (
		user TEXT,
		optionId INTEGER,
		timeAnswered INTEGER,

		FOREIGN KEY (user) REFERENCES user (username),
		FOREIGN KEY (optionId) REFERENCES option (id),
		PRIMARY KEY (optionId, user)
	)`, log);

	let statement = db.prepare("INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
	statement.run(["anon", "password1", "anonymous@gmail.com", "Teacher Huy", 30, "", 0, true]);
	statement.run(["guest", "asdfghjk", "hello1123@yahoo.com", "Guest account", 15, "", 0, true]);
	statement.run(["mniit2", "12345678", "ilou@yahoo.com", "Tran Huy", 15, "", 0, true]);
	statement.finalize(() => console.log("Inserted into table user"));
	
	statement = db.prepare("INSERT INTO userGroup (name, creator, timeCreated, inviteId) VALUES (?, ?, ?, ?)");
	statement.run(["study", "anon", Date.now() - 1000000, "8126797812647916"]);
	statement.finalize(() => console.log("Inserted into table userGroup"));
	
	statement = db.prepare("INSERT INTO groupMember VALUES (?, ?, ?, ?)");
	statement.run([1, "anon", Date.now() - 1000000, 1]);
	statement.run([1, "guest", Date.now() - 1000000, 3]);
	statement.finalize(() => console.log("Inserted into table groupMember"));
	
	statement = db.prepare("INSERT INTO presentation (name, creator, timeCreated) VALUES (?, ?, ?)");
	statement.run(["Hard quiz", "anon", Date.now()]);
	statement.run(["Easy quiz", "anon", Date.now() + 1000]);
	statement.run(["Easy quiz", "guest", Date.now() - 10002]);
	statement.finalize(() => console.log("Inserted into table presentation"));
	
	statement = db.prepare("INSERT INTO slide (presentationId, question, type) VALUES (?, ?, ?)");
	statement.run([1, "1 + 1 = ?", 1]);
	statement.run([1, "Why?", 1]);
	statement.finalize(() => console.log("Inserted into table slide"));
	
	statement = db.prepare("INSERT INTO option (slideId, optionText, isCorrect) VALUES (?, ?, ?)");
	statement.run([1, "2", true]);
	statement.run([1, "10", false]);
	statement.run([1, "II", false]);
	statement.run([1, "11", false]);
	
	statement.run([2, "Cause", false]);
	statement.run([2, "Hello", true]);
	statement.run([2, "Eh", false]);
	statement.run([2, "IDK", false]);
	statement.finalize(() => console.log("Inserted into table option"))
});

db.close();
