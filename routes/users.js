const express = require("express");
const router = express.Router();
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

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

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Invalid username or password"
  }),
  function(req, res) {
    req.flash("success", "You are now logged in");

    res.redirect("/");
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) {
        throw err;
      }

      if (!user) {
        return done(null, false, { message: "Unknown user" });
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) {
          return done(err);
        }

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      });
    });
  })
);

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

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are now logged out");
  res.redirect("/users/login");
});

module.exports = router;
