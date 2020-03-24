const express = require('express');
const homeController = require('../controllers/home');

const router = express.Router();


router.get("/:conto&:scambio", homeController.getTotaleAnomali);
router.get("/", homeController.getTotale);


module.exports = router;