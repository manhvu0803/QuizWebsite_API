const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    
    db.run(`CREATE TABLE userGroup (
        name TEXT PRIMARY KEY,
        timeCreated INTEGER
    )`);

    db.run(`CREATE TABLE user (
        username TEXT PRIMARY KEY,
        password TEXT,
        email NOT NULL UNIQUE,
        userGroup TEXT,

        FOREIGN KEY (userGroup) REFERENCES userGroup (name)
    )`);

    db.run(`CREATE TABLE quiz (
        id INTEGER PRIMARY KEY AUTOINCREMENT ,
        name TEXT NOT NULL,
        creator TEXT NOT NULL,
        timeCreated INTEGER,

        UNIQUE (name, creator),
        FOREIGN KEY (creator) REFERENCES user (username)
    )`);

    db.run(`CREATE TABLE question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quizId INTEGER,
        question TEXT,
        correctAnswer TEXT,
        answer1 TEXT,
        answer2 TEXT,
        answer3 TEXT,

        FOREIGN KEY (quizId) REFERENCES quiz (id)
    )`, () => console.log("All table created"));

    let statement = db.prepare("INSERT INTO userGroup VALUES (?, ?)");
    statement.run(["study", Date.now() - 1000000]);
    statement.finalize(() => console.log("Inserted into table userGroup"));
    
    statement = db.prepare("INSERT INTO user VALUES (?, ?, ?, ?)");
    statement.run(["anon", "password1", "anonymous@gmail.com", null]);
    statement.run(["guest", "asdfghjk", "hello1123@yahoo.com", "study"]);
    statement.finalize(() => console.log("Inserted into table user"));
    
    statement = db.prepare("INSERT INTO quiz (name, creator, timeCreated) VALUES (?, ?, ?)");
    statement.run(["Hard quiz", "anon", Date.now()]);
    statement.run(["Easy quiz", "anon", Date.now() + 1000]);
    statement.run(["Easy quiz", "guest", Date.now() - 10002]);
    statement.finalize(() => console.log("Inserted into table quiz"));
    
    statement = db.prepare("INSERT INTO question (quizId, question, correctAnswer, answer1, answer2, answer3) VALUES (?, ?, ?, ?, ?, ?)");
    statement.run([1, "1 + 1 = ?", "2", "||", "10", "two"]);
    statement.run([1, "Why?", "Help", "Eh", "", ""]);
    statement.finalize(() => console.log("Inserted into table question"));
});

db.close();
