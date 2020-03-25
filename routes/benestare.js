const express = require('express');
const benestareController = require('../controllers/benestare');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

router.post("", checkAuth, benestareController.getListaAnomali);

router.get("", checkAuth, benestareController.getPratica);

module.exports = router;