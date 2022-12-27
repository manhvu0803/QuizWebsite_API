# api gets data
1. presentation_present_data: [presenters], [viewers], isGroupPresent, [slides] or currentSlideId
2. slide_present_data with currentSlideId (done)
3. chat
4. question
5. result list


# api events
## Slide changed
moveSlide?slideId --> moveSlide slideId = ...
chooseOption?optionId --> updateResult result= .... (slideId, optionId, chooser, choice, time) --> +1 amount option

## Chat
sendChat?message&presentationId --> messReceive = ... (mess, username, displayName, time)

## Question Q&A:
sendQuestion?question&presentationId --> questionReceive = ... (questionId, question, username, displayName, time, vote=0)
voteQuestion?questionId&presentationId&action=-1 +1 --> updateQuestionVote (questionId, actionVote (-1 +1))
updateQuestionStatus?questionId&presentationId&newStatus --> updateQuestionStatus (questionId, newStatus)