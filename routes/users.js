const express = require("express");
const userController = require("../controller/user.js");
const router = express.Router();
const auth = require("../middlewares/auth").auth;
const validate = require("../middlewares/validator").validate;

router.get("/", auth, validate, userController.getLoggedUser);

router.post("/", userController.register);
router.post("/login", userController.login);
router.post("/logout", auth, validate, userController.logout);


module.exports = router;