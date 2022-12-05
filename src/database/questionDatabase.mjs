import * as db from "./database.mjs"

/**
 * @typedef {Object} slide
 * @property {number} id
 * @property {number} presentationId
 * @property {string} question
 * @property {string} correctAnswer
 * @property {string} answer1
 * @property {string} answer2
 * @property {string} answer3
 */

/**
 * @typedef {Object} presentation
 * @property {number} id
 * @property {string} name
 * @property {string} creator
 * @property {number} timeCreated Epoch timestamp
 */

/**
 * Get all the presentations of a user
 * @param {string} creator creator username
 * @returns {Promise<presentation[]>} array of presentations
 */
export function getPresentationsOf(creator) {
	return db.getAllData("presentation", "creator", creator);
}

export function createPresentation(data) {
	let { columns, values } = db.columnValue(data);
	return db.insertData("presentation", columns, values);
}

export function updatePresentation(data) {
	let { columns, values } = db.columnValue(data);
	return db.insertData("presentation", columns, values);
}

/**
 * Get all slides of a presentation
 * @param {string} presentationId presentation ID
 * @returns {Promise<slide[]>} array of slides
 */
export function getAllSlides(presentationId) {
	return db.getAllData("slide", "presentationId", presentationId);
}

export function getSlide(slideId) {
	return db.getData("slide", "slideId", slideId);
}

export function createSlide(presentationId, question) {
	return db.insertData("slide", ["presentationId", "question"], [presentationId, question]);
}

export function updateSlide(slideId, question) {
	return db.updateData("slide", "question", question, "slideId", slideId);
}

export function getAllAnswers(slideId) {
	return db.getAllData("answer", "slideId", slideId);
}

export function addAnswer(slideId, answerText, isCorrect) {
	return db.insertData("slide", ["slideId", "answerText", "isCorrect"], [slideId, answerText, isCorrect]);
}

export function updateSlide(slideId, question) {
	return db.updateData("slide", "question", question, "slideId", slideId);
}
