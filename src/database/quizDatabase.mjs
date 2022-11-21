import { getData, getAllData, updateData, insertData } from "./database.mjs"

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
 * @param {*} valueToGet 
 * @param {string} property default is username
 * @returns {Promise<user>} user data
 */
export function getUser(valueToGet, property = "username") {
	return getData("user", property, valueToGet);
}

export async function setUser(username, clientId, data) {
	let { columns, values } = columnValue(data);
	let token = await getData("token", "clientId", clientId);

	if (token) {
		return updateData("user", columns, values, ["user", "clientId"], [username, clientId]);
	}
	else {
		return 
	}
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
