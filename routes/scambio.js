const express = require('express');
const benestareController = require('../controllers/benestare');

const router = express.Router();



router.post("", benestareController.getListaScambioAnomali);

router.get("", benestareController.getPraticaScambio);

module.exports = router;