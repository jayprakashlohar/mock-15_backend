const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRouter = express.Router();
const { UserModel } = require("../Modules/User.model");

userRouter.post("/signup", async (req, res) => {
  const { email, password ,name} = req.body;
  const userPresent = await UserModel.findOne({ email });

  if (userPresent?.email) {
    res.status(404).send("Try loggin in, already exist");
  } else {
    try {
      bcrypt.hash(password, 4, async function (err, hash) {
        const user = new UserModel({ name,email, password: hash });
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

userRouter.get("/getProfile", async (req, res) => {
  let token = req.headers.token;
  // console.log(token)
  try {
    var decoded = jwt.verify(token, "hush");
    console.log(decoded)
    let { userID } = decoded;
        console.log(userID);

    let userDetails = await UserModel.findOne({ _id: userID });
    console.log(userDetails);

    res.send({
      res: {
        name: userDetails.name,
        email: userDetails.email,
      },
    });
  } catch (err) {
    res.status(404).send({ res: "Something went wrong " });
    console.log(err);
  }
});

userRouter.get("/calculateBMI", async (req, res) => {
  let { height, weight } = req.body;
  let token = req.headers.token;

  try {
    let heightInMeter = height / 3;
    heightInMeter = heightInMeter.toFixed(2);

    let bmi = weight / heightInMeter;
    bmi = bmi.toFixed(2);

    let decoded = jwt.verify(token, "hush");

    let { UserId } = decoded;

    let userDetails = await UserModel.findOne({ _id: UserId });
    let { bmiHistory } = userDetails;
    let data = { height, weight, bmi };
    bmiHistory.push(data);

    await UserModel.findByIdAndUpdate({ _id: UserId }, userDetails);
    res.status(200).send({ res: bmi });
  } catch (err) {
    res.status(404).send({ res: "Something went wrong " });
    console.log(err);
  }
});

userRouter.get("/getCalculation", async (req, res) => {
  let token = req.headers.token;

  try {
    let decoded = jwt.verify(token, "hush");
    let { UserId } = decoded;

    let userDetails = await UserModel.findOne({ _id: UserId });

    res.send({ bmiHistory: userDetails.bmiHistory });
  } catch (err) {
    res.status(404).send({ res: "Something went wrong " });
    console.log(err);
  }
});

module.exports = { userRouter };
