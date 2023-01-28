const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRouter = express.Router();
const { UserModel } = require("../Modules/User.model");

userRouter.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const userPresent = await UserModel.findOne({ email });

  if (userPresent?.email) {
    res.status(404).send("Try loggin in, already exist");
  } else {
    try {
      bcrypt.hash(password, 4, async function (err, hash) {
        const user = new UserModel({ email, password: hash });
        await user.save();
        res.status(200).send("Sign up successfull");
      });
    } catch (err) {
      console.log(err);
      res.status(404).send("Something went wrong, pls try again later");
    }
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });

    if (user.length > 0) {
      const hashed_password = user[0].password;
      bcrypt.compare(password, hashed_password, function (err, result) {
        if (result) {
          const token = jwt.sign({ userID: user[0]._id }, "hush");
          res.send({ msg: "Login successfull", token: token });
        } else {
          res.status(404).send("Login failed");
        }
      });
    } else {
      res.status(404).send("Login failed");
    }
  } catch {
    res.status(404).send("Something went wrong, pls try again later");
  }
});

module.exports = { userRouter };
