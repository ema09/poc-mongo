const express = require('express');
const benestareController = require('../controllers/benestare');

const router = express.Router();



router.post("", benestareController.getListaAnomali);

router.get("", benestareController.getPratica);

module.exports = router;