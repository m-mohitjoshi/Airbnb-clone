if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    exprires: Date.now() + 7 * 24 * 60 * 60 * 1000, // milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // to prevent cross-scripting attack
  },
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.ATLASDB_URL); //"mongodb://127.0.0.1:27017/wanderlust"
}

app.listen(8080, () => {
  console.log("Listening to Port");
});

// app.get("/testlisting", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My new Villa",
//     description: "Beach Life",
//     price: 2200,
//     location: "Lakshdweep",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("Sample Saved");
//   res.send("Nice Test")
// });

// app.get("/demouser",async(req, res) =>{
//   let fakeuser = new User({
//     email:"abc!gmail.com",
//     username: "delta-student2"
//   });
//   let registeruser = await User.register(fakeuser, "helloworld");
//   res.send(registeruser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err });
});
