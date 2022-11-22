import { getData, getAllData, updateData, insertData, deleteData } from "./database.mjs"

/**
 * @typedef {Object} user
 * @property {string} username
 * @property {string} password
 * @property {string} email
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

export function addGroup(data) {
	let { columns, values } = columnValue(data);
	return insertData("userGroup", columns, values);
}

export function updateGroup(name, data) {
	let { columns, values } = columnValue(data);
	return updateData("userGroup", columns, values, "name", name);
}

export function addGroupMember(group, user, isOwner = false) {
	return insertData("groupMember", ["group", "user", "timeJoined", "isOwner"], [group, user, Date.now(), isOwner]);
}

export function updateGroupMember(group, user, isOwner) {
	return updateData("groupMember", ["group", "user"], [group, user], "isOwner", isOwner);
}

export function removeGroupMember(group, user) {
	return deleteData("groupMember", ["group", "user"], [group, user]);
}

function columnValue(data) {
	let columns = [];
	let values = [];

	for (let property in data) {
		columns.push(property);
		values.push(data[property]);
	}

	return { columns, values };
}

export async function getToken(compareValue, property = "accessToken") {
	let data = await getData("token", property, compareValue);
	data.client = { id: data.clientId };
	return data;
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
