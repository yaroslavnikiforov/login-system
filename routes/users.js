var express = require("express");
var router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "../uploads" });

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
  const password2 = req.body.password2;

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
  req.checkBody("email", "Email is not valid").notEmpty();
  req.checkBody("username", "Username field is required").isEmail();
  req.checkBody("password", "Password field is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  // check errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("register", { errors });
  } else {
    console.log("No errors");
  }
});

module.exports = router;
