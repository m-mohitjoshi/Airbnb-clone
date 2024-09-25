const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const listingController = require("../controllers/listing");
const{isLoggedIn, isOwner, validateListing} = require("../middleware");
const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))  // index route
.post(isLoggedIn, upload.single('listing[image]'), validateListing,wrapAsync(listingController.createListing)); //create route

  
// new route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing)) //show router
.put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing)) //update route
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //delete route

//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router;