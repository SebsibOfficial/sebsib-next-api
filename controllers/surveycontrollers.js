const jwt = require('jsonwebtoken');
const { } = require("../models");
const ObjectId = require('mongoose').Types.ObjectId;
const sanitizeAll = require('../utils/genSantizer');
const inputTranslate = require('../utils/translateIds');

const getSurveyController = async (req, res, next) => { }

const sendResponseController = async (req, res, next) => { }

module.exports = { getSurveyController, sendResponseController }
