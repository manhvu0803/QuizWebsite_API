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

export function getPresentation(id) {
	return db.getAllData("presentation", "id", id);
}

export function addPresentation(name, creator) {
	return db.insertData("presentation", ["name", "creator", "timeCreated"], [name, creator, Date.now()]);
}

export function updatePresentation(id, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("presentation", "id", id, columns, values);
}

export function removePresentation(id) {
	await removeSlidesOf(id);
	return db.deleteData("presentation", "id", id);
}

/**
 * Get all slides of a presentation
 * @param {string} presentationId presentation ID
 * @returns {Promise<slide[]>} array of slides
 */
export function getSlidesOf(presentationId) {
	return db.getAllData("slide", "presentationId", presentationId);
}

export function getSlide(id) {
	return db.getData("slide", "id", id);
}

export function addSlide(presentationId, question) {
	return db.insertData("slide", ["presentationId", "question"], [presentationId, question]);
}

export function updateSlide(id, question) {
	return db.updateData("slide", "question", question, "id", id);
}

export async function removeSlide(id) {
	await removeAnswersOf(id);
	return db.deleteData("slide", "id", id);
}

export async function removeSlidesOf(presentationId) {
	let slides = await getSlidesOf(presentationId);
	let promises = [];
	for (let slide in slides) {
		promises.push(removeAnswersOf(slide.id));
	}

	await Promise.all(promises);

	return db.deleteData("slide", "presentationId", presentationId);
}

export function getAnswer(id) {
	return db.getData("answer", "id", id);
}

export function getAnswersOf(slideId) {
	return db.getAllData("answer", "slideId", slideId);
}

export function addAnswer(slideId, answerText, isCorrect) {
	return db.insertData("answer", ["slideId", "answerText", "isCorrect"], [slideId, answerText, isCorrect]);
}

export function updateAnswer(id, answerText) {
	return db.updateData("answer", "answerText", answerText, "id", id);
}

export function removeAnswer(id) {
	return db.deleteData("answer", "id", id);
}

export function removeAnswersOf(slideId) {
	return db.deleteData("answer", "slideId", slideId);
}