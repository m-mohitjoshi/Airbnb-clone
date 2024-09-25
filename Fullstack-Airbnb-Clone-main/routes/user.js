const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware");
const userControlller = require("../controllers/user");


router.route("/signup")
.get(userControlller.renderSignupForm)
.post(wrapAsync(userControlller.signup));

router.route("/login")
.get(userControlller.renderLoginForm)
.post(savedRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), userControlller.login);

router.get("/logout", userControlller.logout);

router.get("/map", userControlller.showmap);

module.exports = router;
