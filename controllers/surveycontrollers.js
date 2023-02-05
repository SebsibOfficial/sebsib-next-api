const jwt = require('jsonwebtoken');
const { Survey } = require("../models");
const ObjectId = require('mongoose').Types.ObjectId;
const sanitizeAll = require('../utils/genSantizer');
const inputTranslate = require('../utils/translateIds');

const getSurveyController = async (req, res, next) => {
  const surveyId = sanitizeAll(req.params.id);

  try {
    if (!(await Survey.exists({ _id: surveyId }))) return res.status(404).json({ message: "Survey not found" });

    var _survey = await Survey.aggregate([
      {
        "$match": {
          "_id": new ObjectId(surveyId)
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

const sendResponseController = async (req, res, next) => { }

module.exports = { getSurveyController, sendResponseController }
