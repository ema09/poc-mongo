const express = require('express');
const benestareController = require('../controllers/benestare');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

router.get("/:tipo&:pratica", checkAuth, benestareController.getData);

module.exports = router;