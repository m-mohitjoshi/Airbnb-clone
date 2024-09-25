const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/review");


//reviews route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
  
//review delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,wrapAsync(reviewController.destroyReview));
  
module.exports = router;