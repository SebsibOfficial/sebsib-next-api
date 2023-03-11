const router = require('express').Router();
const { getSurveyController, sendResponseController, getMetaInfo } = require('../controllers');

router.get('/getsurvey/:id', getSurveyController);
router.post('/sendresponse', sendResponseController);
router.get('/getmetainfo/:id', getMetaInfo);

module.exports = router;
