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

/**
 * 
 * @param {*} compareValue 
 * @param {string} column default is "id"
 * @returns 
 */
export function getGroup(compareValue, column = "id") {
	return db.getData("userGroup", column, compareValue);
}

/**
 * 
 * @param {*} compareValue 
 * @param {string} column default is "id"
 * @returns 
 */
export function getAllGroup(compareValue, column = "id") {
	return db.getAllData("userGroup", column, compareValue);
}

/**
 * @param {number} groupId 
 * @returns {Promise<>}
 */
export function getGroupMembers(groupId) {
	let query = `SELECT gm.timeJoined, gm.role, user.username, user.email, user.displayName 
                 FROM groupMember gm INNER JOIN user ON gm.user = user.username
				 WHERE gm.groupId = '${groupId}'`;

	return db.all(query);
}

export async function getMember(username, groupId) {
	return db.getData("groupMember", ["user", "groupId"], [username, groupId])
}

export function getGroupsUserIn(username) {
	let query = `SELECT ug.* 
				 FROM userGroup ug INNER JOIN groupMember gm ON ug.id = gm.groupId 
				 WHERE gm.user = '${username}'`;
	return db.all(query);
}

export async function addGroup(name, creator) {
	let result = await db.insertData("userGroup", ["name", "creator", "timeCreated", "inviteId"], [name, creator, Date.now(), uuid()]);
	await db.insertData("groupMember", ["groupId", "user", "timeJoined", "role"], [result.lastID, creator, Date.now(), 1]);
	return result; 
}

export function updateGroup(groupId, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("userGroup", columns, values, "id", groupId);
}

export async function deleteGroup(groupId) {
	await db.deleteData("groupMember", "groupId", groupId);
	return db.deleteData("userGroup", "id", groupId);
}

export function addGroupMember(groupId, username, role = 3) {
	return db.insertData("groupMember", ["groupId", "user", "timeJoined", "role"], [groupId, username, Date.now(), role]);
}

export function updateGroupMember(groupId, username, role) {
	return db.updateData("groupMember", "role", role, ["groupId", "user"], [groupId, username]);
}

export function removeGroupMember(groupId, username) {
	return db.deleteData("groupMember", ["groupId", "user"], [groupId, username]);
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

/**
 * Add creator data to an array of entity data
 * @param {{ creator: string }[]} entities 
 */
export async function addCreatorData(entities) {
	for (let entity of entities) {
		entity.creator = await getUser(entity.creator);
		delete entity.creator.password;
	}
}
