const express = require("express");
const homeController = require("../controller/home.js");
const router = express.Router();
const auth = require("../middlewares/auth").auth;
const validate = require("../middlewares/validator").validate;

router.get("/", homeController.welcome);
router.get("/welcome", auth, validate, homeController.welcomeAuth);

module.exports = router;