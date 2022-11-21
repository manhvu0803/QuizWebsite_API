import sqlite from "sqlite3";

const db = new sqlite.Database("database.db");

export function getData(table, columns, valuesToGet) {
	return query(queryString(table, columns, valuesToGet));
}

export function getAllData(table, columns, valuesToGet) {
	return queryAll(queryString(table, columns, valuesToGet));
}

export function queryString(table, columns, valuesToGet) {
	let string = `SELECT * FROM ${table} WHERE ${columns[0]} = '${valuesToGet[0]}'`;

	for (let i = 1; i < columns.length; ++i) {
		string += ` AND ${columns[i]} == '${valuesToGet[i]}'`;
	}

	return string;
}

export function query(queryString) {
	return new Promise((resolve, reject) => {
		db.get(queryString, (err, row) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(row);
			}
		});
	})
}

export function queryAll(queryString) {
	return new Promise((resolve, reject) => {
		db.all(queryString, (err, rows) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(rows);
			}
		});
	})
}

export default db;