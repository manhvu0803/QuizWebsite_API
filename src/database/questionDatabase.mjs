import { CommentType, SlideType } from "../define.mjs";
import * as db from "./database.mjs"
import { addCreatorData } from "./userDatabase.mjs";
import { v4 as uuid } from "uuid";

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
export async function getPresentationsOf(creator) {
	let data = await db.getAllData("presentation", "creator", creator);
	return data;
}

/**
 * Get all the presentations of a user
 * @param {string} collaborator collaborator username
 * @returns {Promise<presentation[]>} array of presentations
 */
export async function getPresentationsByCollaborator(collaborator) {
	let query = `SELECT p.* FROM
	             presentation p JOIN collaborator c ON p.id = c.presentationId
				 WHERE c.user = (?)`;
	
	let presentations = await db.all(query, collaborator);
	await addCreatorData(presentations);

	return presentations;
}

/**
 * 
 * @param {any} compareValue 
 * @param {"id" | "inviteId"} column Default is "id" 
 * @returns 
 */
export function getPresentation(compareValue, column = "id") {
	return db.getData("presentation", column, compareValue);
}

export function addPresentation(name, creator) {
	return db.insertData("presentation", ["name", "creator", "timeCreated", "inviteId"], [name, creator, Date.now(), uuid()]);
}

export function updatePresentation(id, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("presentation", columns, values, "id", id);
}

export async function removePresentation(id) {
	await Promise.all([removeSlidesOf(id), removeCollaboratorsOf(id), removeCommentsIn(id)]);
	return db.deleteData("presentation", "id", id);
}

export async function addCollaborator(presentationId, username) {
	return db.insertData("collaborator", ["presentationId", "user"], [presentation.id, username], "presentationId", presentationId);
}

export async function addInvitedCollaborator(inviteId, username) {
	let presentation = await getPresentation(inviteId, "inviteId")
	if (!presentation) {
		throw new Error("Invalid invite ID");
	}

	return db.upsertData("collaborator", ["presentationId", "user"], [presentation.id, username], ["presentationId", "user"], [presentation.id, username]);
}

export function getCollaborators(presentationId) {
	let query = `SELECT user.*
	             FROM user INNER JOIN collaborator ON user.username = collaborator.user
				 WHERE collaborator.presentationId = ?`;
	return db.all(query, presentationId);
}

export function removeCollaborator(presentationId, username) {
	return db.deleteData("collaborator", ["presentationId", "user"], [presentationId, username]);
}

export function removeCollaboratorsOf(presentationId) {
	return db.deleteData("collaborator", "presentationId", presentationId);
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

export function addSlide(presentationId, question, type) {
	return db.insertData("slide", ["presentationId", "question", "type"], [presentationId, question, type]);
}

export function updateSlide(id, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("slide", columns, values, "id", id);
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
	let query = `SELECT option.*, COUNT(answer.optionId) as answerAmount 
	             FROM option LEFT JOIN answer ON option.id = answer.optionId
	             WHERE option.id = ?
	             GROUP BY option.id`;
	return db.get(query, [id]);
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

export function updateOption(id, data) {
	let { columns, values } = db.columnValue(data);
	return db.updateData("option", columns, values, "id", id);
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

export function getAnswersOfUser(username, slideId) {
	let query = `SELECT answer.*
				 FROM answer INNER JOIN option ON answer.optionId = option.id
				 WHERE option.slideId = ${slideId} AND answer.user = ${username}`;
	return db.all(query);
}

export function getAnswersOfSlide(slideId) {
	let query = `SELECT answer.*
				 FROM answer INNER JOIN option ON answer.optionId = option.id
				 WHERE option.slideId = ${slideId}
				 ORDER BY answer.timeAnswered ASC`;
	return db.all(query);
}

export function getAnswersOfPresentation(presentationId) {
	let query = `SELECT answer.*, option.optionText, slide.question
				 FROM answer INNER JOIN option ON answer.optionId = option.id INNER JOIN slide ON option.slideId = slide.id
				 WHERE slide.presentationId = ${presentationId}
				 ORDER BY answer.timeAnswered ASC`;
	return db.all(query);
}

export function addAnswer(username, optionId) {
	return db.upsertData("answer", ["user", "optionId", "timeAnswered"], [username, optionId, Date.now()], ["user", "optionId"], [username, optionId]);
}

export function removeAnswer(username, optionId) {
	return db.deleteData("answer", ["user", "optionId"], [username, optionId]);
}

export function addComment(presentationId, username, commentText, type = CommentType.Comment) {
	return db.insertData("comment", ["presentationId", "user", "commentText", "type", "time"], [presentationId, username, commentText, type, Date.now()])
}

export function answerQuestion(commentId, answerText) {
	return db.updateData("comment", "answerText", answerText, "id", commentId);
}

export async function getComments(ids, username) {
	let result = [];
	for (let id of ids) {
		let comment = await getComment(id, username);
		result.push(comment);
	}

	return result;
}

export async function getComment(id, username) {
	let query = `SELECT cmt.*, COUNT(upv.commentId) as voteAmount 
	             FROM comment cmt LEFT JOIN upvote upv ON cmt.id = upv.commentId
	             WHERE cmt.id = ?
	             GROUP BY cmt.id`;

	let [result, vote] = await Promise.all([
		db.get(query, [id]), 
		db.getData("upvote", ["commentId", "user"], [id, username])
	]);
	
	result.isUpvoted = Boolean(vote);
	return result;
}

export async function upvote(commentId, username) {
	return db.insertData("upvote", ["commentId", "user", "time"], [commentId, username, Date.now()]);
}

export async function unvote(commentId, username) {
	return db.deleteData("upvote", ["commentId", "user"], [commentId, username]);
}

export async function isCommentUpvoted(commentId, username) {
	return Boolean(await db.getData("upvote", ["commentId", "user"], [commentId, username]));
}

export async function getCommentsOf(presentationId, username) {
	let query = `SELECT cmt.*, COUNT(upv.commentId) as voteAmount 
				 FROM comment cmt LEFT JOIN upvote upv ON cmt.id = upv.commentId
				 WHERE cmt.presentationId = ?
				 GROUP BY cmt.id`;
	let comments = await db.all(query, [presentationId]);

	let promises = [];
	for (let comment of comments) {
		promises.push(isCommentUpvoted(comment.id, username).then((result) => comment.isUpvoted = result));
	}

	await Promise.all(promises);

	return comments;
}

export async function removeComment(id) {
	await db.deleteData("upvote", "commentId", id);
	return db.deleteData("comment", "id", id)
}

export async function removeCommentsIn(presentationId) {
	return removeComments("presentationId", presentationId);
}

export async function removeCommentsOf(username) {
	return removeComments("user", username);
}

async function removeComments(compareColumn, compareValue) {
	let comments = await db.getAllData("comment", compareColumn, compareValue);

	let promises = [];
	for (let comment of comments) {
		promises.push(removeComment(comment.id));
	}

	await Promise.all(promises);

	return db.deleteData("comment", compareColumn, compareValue);
}
