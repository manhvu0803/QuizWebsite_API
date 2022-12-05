import * as db from "./database.mjs";
import { v4 as uuid } from "uuid";

/**
 * @typedef {Object} user
 * @property {string} username
 * @property {string} password
 * @property {string} email
 * @property {string} displayName
 * @property {number} age
 * @property {string} avatarUrl
 */

/**
 * @typedef {Object} token
 * @property {string} accessToken
 * @property {string} user
 * @property {string} clientId
 */

/**
 * Get user data
 * @param {string} compareValue the value to check
 * @param {"username" | "email"} column the column to check, "username" by default
 * @returns {Promise<user>} user data
 */
 export function getUser(compareValue, column = "username") {
	return db.getData("user", column, compareValue);
}

/**
 * 
 * @param {user} data 
 * @returns 
 */
export function addUser(data) {
	let { columns, values } = db.columnValue(data);
	return db.insertData("user", columns, values);
}

/**
 * @param {string} username
 * @param {user} data
 * @returns {Promise<void>}
 */
export function updateUser(username, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("user", columns, values, "username", username);
}

export function getGroup(compareValue, property = "name") {
	return db.getData("userGroup", property, compareValue);
}

export function getAllGroup(compareValue, property = "name") {
	return db.getAllData("userGroup", property, compareValue);
}

/**
 * @param {string} groupName 
 * @returns {Promise<>}
 */
export function getGroupMembers(groupName) {
	let query = `SELECT gm.timeJoined, gm.role, user.username, user.email, user.displayName 
                    FROM groupMember gm INNER JOIN user ON gm.user = user.username
					WHERE gm.groupName = '${groupName}'`;

	return db.all(query);
}

export function getGroupsUserIn(username) {
	let query = `SELECT ug.* FROM userGroup ug INNER JOIN groupMember gm ON ug.name = gm.groupName WHERE gm.user = '${username}'`;
	return db.all(query);
}

export async function addGroup(name, creator) {
	await db.insertData("userGroup", ["name", "creator", "timeCreated", "inviteId"], [name, creator, Date.now(), uuid()])
	return db.insertData("groupMember", ["groupName", "user", "timeJoined", "role"], [name, creator, Date.now(), 1]);
}

export function updateGroup(name, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("userGroup", columns, values, "name", name);
}

export function addGroupMember(groupName, username, role = 3) {
	return db.insertData("groupMember", ["groupName", "user", "timeJoined", "role"], [groupName, username, Date.now(), role]);
}

export function updateGroupMember(groupName, username, role) {
	return db.updateData("groupMember", ["groupName", "user"], [groupName, username], "role", role);
}

export function removeGroupMember(groupName, username) {
	return db.deleteData("groupMember", ["groupName", "user"], [groupName, username]);
}

export function addToken(token, clientId, username) {
	return db.insertData("token", ["accessToken", "clientId", "user"], [token, clientId, username]);
}

/**
 * @param {string} compareValue 
 * @param {"accessToken" | "clientId" | "user"} property
 * @return {Promise<token>}
 */
export function getToken(compareValue, property = "accessToken") {
	return db.getData("token", property, compareValue);
}

/**
 * 
 * @param {string} compareValue 
 * @param {"accessToken" | "clientId" | "user"} property
 */
export function removeToken(compareValue, property = "accessToken") {
	return db.deleteData("token", property, compareValue);
}