const jwt = require('jsonwebtoken');
const { Survey, Project, Response } = require("../models");
const ObjectId = require('mongoose').Types.ObjectId;
const { sanitizeAll, checkFaultyAnswers } = require('../utils/genSantizer');
const inputTranslate = require('../utils/translateIds');

const getSurveyController = async (req, res, next) => {
  const idFromLink = sanitizeAll(req.params.id);

  try {
    if (!(await Survey.exists({ link: idFromLink }))) return res.status(404).json({ message: "Survey not found" });

    var _survey = await Survey.aggregate([
      {
        "$match": {
          "link": idFromLink
        }
      },
      {
        "$lookup": {
          "from": "questions",
          "localField": "questions",
          "foreignField": "_id",
          "as": "joined_questions",
        }
      },
      {
        "$lookup": {
          "from": "responses",
          "localField": "responses",
          "foreignField": "_id",
          "as": "joined_responses",
        }
      }
    ]);

    var survey = _survey[0];

    
    if(survey.type === undefined || survey.type === null || survey.type === '' || survey.type === 'REGULAR') 
    return res.status(403).json({
      message: "Survey not availiable"
    });

    return res.status(200).json({
      _id: survey._id,
      shortSurveyId: survey.shortSurveyId,
      name: survey.name,
      questions: survey.joined_questions.sort(function (x, y) { return x.createdOn - y.createdOn; }),
      // i dont think we need to send responses from forms requests
      // responses: survey.joined_responses,
      description: survey.description,
      pic: survey.pic,
      createdOn: survey.createdOn,
      type: survey.type ?? null,
      link: survey.link ?? null,
      status: survey.status ?? null
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
}

const sendResponseController = async (req, res) => {
  // list of response data 
  var response = req.body;
  try {
    var responseId = response._id;

    var survey = await Survey.findOne({ _id: new ObjectId(response.surveyId) });
    if (!survey) return res.status(403).json({ message: "Survey does not exist anymore" });

    // get the project where the surveys id is inside the surveysId array
    var project = await Project.findOne({ surveysId: { $in: [survey._id] } });
    if (!project) return res.status(403).json({ message: "Project does not exist anymore" });

    // if there is an invalid character it discards the input instead of sanitizing it.
    for (var i = 0; i < response.answers.length; i++) {
      var answer = response.answers[i];
      
      if (checkFaultyAnswers(answer.answer)) return res.status(403).json({ message: "Invalid characters in answer" })
    }

    await Response.insertMany([{
      _id: responseId,
      surveyId: response.surveyId,
      shortSurveyId: response.shortSurveyId,
      name: response.name,
      answers: response.answers ?? '',
      sentDate: response.sentDate,
      createdOn: new Date()
    }]);

    await Survey.updateOne({ _id: response.surveyId }, { $push: { "responses": responseId } }).clone();

    return res.status(200).json({ message: "success" })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
}

module.exports = { getSurveyController, sendResponseController }
