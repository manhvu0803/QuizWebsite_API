import { getData, getAllData, updateData, insertData, deleteData, all } from "./database.mjs"

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
 * @typedef {Object} question
 * @property {number} id
 * @property {number} quizId
 * @property {string} question
 * @property {string} correctAnswer
 * @property {string} answer1
 * @property {string} answer2
 * @property {string} answer3
 */

/**
 * @typedef {Object} quiz
 * @property {number} id
 * @property {string} name
 * @property {string} creator
 * @property {number} timeCreated Epoch timestamp
 */

/**
 * @typedef {Object} fullQuiz
 * @property {quiz} data
 * @property {question[]} questions
 */

/**
 * Get user data
 * @param {string} compareValue the value to check
 * @param {"username" | "email"} column the column to check, "username" by default
 * @returns {Promise<user>} user data
 */
export function getUser(compareValue, column = "username") {
	return getData("user", column, compareValue);
}

/**
 * 
 * @param {user} data 
 * @returns 
 */
export function addUser(data) {
	let { columns, values } = columnValue(data);
	return insertData("user", columns, values);
}

/**
 * @param {string} username
 * @param {user} data
 * @returns 
 */
export function updateUser(username, data) {
	let { columns, values } = columnValue(data);
	return updateData("user", columns, values, "username", username);
}

export function getGroup(compareValue, property = "name") {
	return getData("userGroup", property, compareValue);
}

export function getAllGroup(compareValue, property = "name") {
	return getAllData("userGroup", property, compareValue);
}

/**
 * 
 * @param {*} groupName 
 * @returns {Promise<user[]>}
 */
export function getGroupMembers(groupName) {
	let query = `SELECT gm.timeJoined, gm.role, user.username, user.email, user.displayName FROM 
					groupMember gm INNER JOIN user ON gm.user = user.username
					WHERE gm.groupName = '${groupName}'`;

	return all(query);
}

export function getGroupsUserIn(username) {
	let query = `SELECT ug.* FROM userGroup ug INNER JOIN groupMember gm ON ug.name = gm.groupName WHERE gm.user = ${username}`;
	return all(query);
}

export async function addGroup(name, creator) {
	await insertData("userGroup", ["name", "creator", "timeCreated"], [name, creator, Date.now()])
	return insertData("groupMember", ["groupName", "user", "timeJoined", "role"], [name, creator, Date.now(), 1]);
}

export function updateGroup(name, data) {
	let { columns, values } = columnValue(data);
	return updateData("userGroup", columns, values, "name", name);
}

export function addGroupMember(group, user, role = 3) {
	return insertData("groupMember", ["groupName", "user", "timeJoined", "role"], [group, user, Date.now(), role]);
}

export function updateGroupMember(group, user, role) {
	return updateData("groupMember", ["groupName", "user"], [group, user], "role", role);
}

export function removeGroupMember(group, user) {
	return deleteData("groupMember", ["groupName", "user"], [group, user]);
}

function columnValue(data) {
	let columns = [];
	let values = [];

	for (let property in data) {
		if (data[property] !== undefined) {
			columns.push(property);
			values.push(data[property]);
		}
	}

	return { columns, values };
}

export function addToken(token, clientId, username) {
	return insertData("token", ["accessToken", "clientId", "user"], [token, clientId, username]);
}

/**
 * 
 * @param {*} compareValue 
 * @param {"accessToken" | "clientId" | "user"} property 
 * @returns 
 */
export async function getToken(compareValue, property = "accessToken") {
	let data = await getData("token", property, compareValue);
	return data;
}

export function removeToken(compareValue, property = "accessToken") {
	return deleteData("token", property, compareValue);
}

/**
 * Get all the quizzes of a user
 * @param {string} creator creator username
 * @returns {Promise<quiz[]>} array of quizzes
 */
export function getQuizzesOf(creator) {
	return getAllData("quiz", "creator", creator);
}

/**
 * Get a quiz from its name and creator
 * @param {*} creator creator username
 * @param {*} quizName name of the quiz
 * @returns {Promise<fullQuiz>} full quiz data and its questions
 */
export async function getQuizByName(creator, quizName) {
	let quiz = await getData("quiz", ["name", "creator"], [quizName, creator]);

	if (quiz) {
		return getFullQuiz(quiz);
	}
	
	return null;
}

/**
 * Get all questions of a quiz
 * @param {string} quizId quiz ID
 * @returns {Promise<question[]>} array of questions
 */
export function getQuestions(quizId) {
	return getAllData("question", "quizId", quizId);
}

/**
 * 
 * @param {quiz} quiz 
 * @returns {fullQuiz}
 */
async function getFullQuiz(quiz) {
	let questions = await getAllData("question", "quizId", quiz.id);

	return {
		data: quiz,
		questions: questions
	};
}
