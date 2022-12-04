import sqlite from "sqlite3";

import { getQuestions, getQuizzesOf, getUser } from "./quizDatabase.mjs";

sqlite.verbose();
const db = new sqlite.Database("database.db");

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

	// db.all("SELECT * FROM user", (err, rows) => console.log(rows));
	// db.all("SELECT * FROM quiz", (err, rows) => console.log(rows));
	// db.all("SELECT * FROM question", (err, rows) => console.log(rows));

	// db.all(`SELECT * FROM user WHERE user.username = 'guest'`, (err, rows) => console.log(rows));
	// db.all(`SELECT * FROM question JOIN quiz ON question.quizId = quiz.id`, (err, rows) => console.log(rows));
	db.all(`SELECT 
    name
FROM 
    sqlite_schema
WHERE 
    type ='table' AND 
    name NOT LIKE 'sqlite_%'`,  (err, rows) => console.log(rows));
});

// db.close();

// async function func() {
// 	let data = await getQuizzesOf("anon");
// 	let questions = await getQuiz(data[0].id);
// 	console.log(questions);
// };

// func()