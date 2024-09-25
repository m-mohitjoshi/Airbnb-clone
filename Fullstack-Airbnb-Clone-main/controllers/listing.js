const { geocode } = require('opencage-api-client');
const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    req.flash("error", "Failed to fetch listings.");
    res.redirect("/");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing does not exist !");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    req.flash("error", "Failed to fetch listing.");
    res.redirect("/listings");
  }
};

module.exports.createListing = async (req, res, next) => {
  try {
    const { location } = req.body.listing;

    // Perform geocoding using OpenCage API
    const response = await geocode({ q: location, key: process.env.OPENCAGE_API_KEY });

    // Extract coordinates from geocoding response
    const { geometry } = response.results[0];

    const newListing = new Listing({
      ...req.body.listing,
      geometry: {
        type: 'Point',
        coordinates: [geometry.lng, geometry.lat]
      }
    });


    //listing func
    let url = req.file.path;
    let filename = req.file.filename;
  
    newListing.owner = req.user._id;
    newListing.image = { url, filename };


    // Save the new listing
    await newListing.save();

    req.flash("success", "New Listing Created !");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Failed to create new listing.");
    res.redirect("/listings/new");
  }
};

module.exports.editListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing does not exist !");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    // Ensure originalImageUrl is properly defined before manipulation
    if (originalImageUrl) {
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_350");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (error) {
    console.error("Error rendering edit form:", error);
    req.flash("error", "Failed to render edit form.");
    res.redirect("/listings");
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body.listing;

    // Perform geocoding using OpenCage API
    const response = await geocode({ q: location, key: process.env.OPENCAGE_API_KEY });

    // Extract coordinates from geocoding response
    const { geometry } = response.results[0];

    // Update listing data
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
      geometry: {
        type: 'Point',
        coordinates: [geometry.lng, geometry.lat]
      }
    });

    if (typeof req.file != "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Failed to update listing.");
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.destroyListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting listing:", error);
    req.flash("error", "Failed to delete listing.");
    res.redirect("/listings");
  }
};
