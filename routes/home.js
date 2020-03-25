const express = require('express');
const homeController = require('../controllers/home');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

router.get("/:conto&:scambio",checkAuth, homeController.getTotaleAnomali);
router.get("/",checkAuth, homeController.getTotale);
router.post("/",checkAuth, homeController.getAnomali);


module.exports = router;