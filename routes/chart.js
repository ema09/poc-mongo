const express = require('express');
const benestareController = require('../controllers/benestare');

const router = express.Router();

router.get("/:tipo&:pratica", benestareController.getData);

module.exports = router;