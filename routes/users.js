const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "./uploads" });

const User = require("../models/user");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "Register" });
});

router.get("/login", function(req, res, next) {
  res.render("login", { title: "Login" });
});

router.post("/register", upload.single("profileimage"), function(
  req,
  res,
  next
) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  let profileImage;

  if (req.file) {
    console.log("Uploading file...");

    profileImage = req.file.filename;
  } else {
    console.log("No file uploaded.");

    profileImage = "noimage.jpg";
  }

  // form validator
  req.checkBody("name", "Name field is required").notEmpty();
  req.checkBody("email", "Email field is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("username", "Username field is required").notEmpty();
  req.checkBody("password", "Password field is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  // check errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("register", { errors });
  } else {
    const newUser = new User({
      name,
      email,
      username,
      password,
      profileImage
    });

    User.createUser(newUser, function(err, user) {
      if (err) {
        throw err;
      } else {
        console.log(user);
      }
    });

    req.flash("success", "You are now registered and can login");

    res.location("/");
    res.redirect("/");
  }
});

module.exports = router;
