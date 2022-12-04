import { getData, getAllData } from "./database.mjs"
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
 * Get all the quizzes of a user
 * @param {string} creator creator username
 * @returns {Promise<quiz[]>} array of quizzes
 */
export function getQuizzesOf(creator) {
	return getAllData("quiz", "creator", creator);
}

/**
 * Get a quiz from its name and creator
 * @param {string} creator creator username
 * @param {string} quizName name of the quiz
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
