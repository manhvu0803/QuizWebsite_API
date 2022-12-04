import sqlite from "sqlite3";

const db = new sqlite.Database("database.db");
db.run("PRAGMA foreign_keys = ON", () => console.log("Database is ready"));

export function getData(table, columns, compareValues) {
	return get(queryString(table, columns, compareValues));
}

export function getAllData(table, columns, compareValues) {
	return all(queryString(table, columns, compareValues));
}

export function insertData(table, columns, values) {
	let string = `'${values[0]}'`;

	for (let i = 1; i < values.length; ++i) {
		string += `, '${values[i]}'`;
	}

	return run(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${string})`);
}

export function deleteData(table, columns, compareValues) {
	let string = `DELETE FROM ${table} WHERE ${columnValueString(columns, compareValues)}`;
	return run(string);
}

export function updateData(table, columns, values, compareColumns, compareValues) {
	let string = `UPDATE ${table} SET ${columnValueString(columns, values, ",")}`
	string += ` WHERE ${columnValueString(compareColumns, compareValues)}`;
	console.log(string);
	return run(string);
}

export function queryString(table, columns, compareValues) {
	return `SELECT * FROM ${table} WHERE ${columnValueString(columns, compareValues)}`;
}

function columnValueString(columns, values, seperator = " AND") {
	if (Array.isArray(columns)) {
		let string = `${columns[0]} = '${values[0]}'`;
	
		for (let i = 1; i < columns.length; ++i) {
			string += `${seperator} ${columns[i]} = '${values[i]}'`;
		}

		return string;
	}
	else {
		return `${columns} = '${values}'`;
	}
}

export function get(queryString, params = []) {
	return new Promise((resolve, reject) => {
		db.get(queryString, params, (err, row) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(row);
			}
		});
	})
}

export function all(queryString, params = []) {
	return new Promise((resolve, reject) => {
		db.all(queryString, params, (err, rows) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(rows);
			}
		});
	})
}

export function run(queryString, params = []) {
	return new Promise((resolve, reject) => {
		db.run(queryString, params, (err, rows) => {
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