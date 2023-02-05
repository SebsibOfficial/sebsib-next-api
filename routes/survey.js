const router = require('express').Router();
const { getSurveyController, sendResponseController } = require('../controllers');

router.get('/getsurvey/:id', getSurveyController);
router.post('/sendresponse', sendResponseController);

module.exports = router;
