import { SlideType } from "../define.mjs";
import * as db from "./database.mjs"

/**
 * @typedef {Object} slide
 * @property {number} id
 * @property {number} presentationId
 * @property {string} question
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
	return db.getData("presentation", "id", id);
}

export function addPresentation(name, creator) {
	return db.insertData("presentation", ["name", "creator", "timeCreated"], [name, creator, Date.now()]);
}

export function updatePresentation(id, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("presentation", columns, values, "id", id);
}

export async function removePresentation(id) {
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

export function addSlide(presentationId, question, type = SlideType.OneChoice) {
	return db.insertData("slide", ["presentationId", "question", "type"], [presentationId, question, type]);
}

export function updateSlide(id, question) {
	return db.updateData("slide", "question", question, "id", id);
}

export async function removeSlide(id) {
	await removeOptionsOf(id);
	return db.deleteData("slide", "id", id);
}

export async function removeSlidesOf(presentationId) {
	let slides = await getSlidesOf(presentationId);
	let promises = [];
	for (let slide of slides) {
		promises.push(removeOptionsOf(slide.id));
	}

	await Promise.all(promises);

	return db.deleteData("slide", "presentationId", presentationId);
}

export function getOption(id) {
	return db.getData("option", "id", id);
}

export function getOptionsOf(slideId) {
	let query = `SELECT option.*, COUNT(answer.optionId) as answerAmount 
					FROM option LEFT JOIN answer ON option.id = answer.optionId
					WHERE option.slideId = ${slideId}
					GROUP BY option.id`;
	return db.all(query);
}

export function addOption(slideId, optionText, isCorrect) {
	return db.insertData("option", ["slideId", "optionText", "isCorrect"], [slideId, optionText, isCorrect]);
}

export function updateOption(id, optionText) {
	return db.updateData("option", "optionText", optionText, "id", id);
}

export async function removeOptionsOf(slideId) {
	let options = await getOptionsOf(slideId);
	let promises = [];
	for (let option of options) {
		promises.push(removeOptions(option.id));
	}

	return Promise.all(promises);
}

export async function removeOptions(id) {
	await db.deleteData("answer", "optionId", id);
	return db.deleteData("option", "id", id);
}

export function getAnswer(username, optionId) {
	return db.getData("answer", ["user", "optionId"], [username, optionId]);
}

export function getAnswersOf(username, slideId) {
	let query = `SELECT answer.*
				 FROM answer INNER JOIN option ON answer.optionId = option.id
				 WHERE option.slideId = ${slideId} AND answer.user = ${username}`;
	return db.all(slideId);
}

export function addAnswer(username, optionId) {
	return db.insertData("answer", ["user", "optionId", "timeAnswerd"], [username, optionId, Date.now()]);
}

export function removeAnswer(username, optionId) {
	return db.deleteData("answer", ["user", "optionId"], [username, optionId]);
}