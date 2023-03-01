const express = require("express");
const md5 = require("md5");
const uuid = require("uuid");

const userModel = require("../models/user");
const tokenModel = require("../models/token");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await userModel.create({
      name,
      email,
      password,
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log(email, result._id);
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.post("/login", async (req, res) => {
  const encoded = req.header("Authorization");
  const credential = encoded.split(" ")[1];
  const decodedCredential = Buffer.from(credential, "base64").toString();
  const [email, password] = decodedCredential.split("=");
  try {
    console.log("\x1b[36m%s", email, "attempt to sign in!", "\x1b[0m");

    const user = await userModel
      .findOne({
        email: email,
        password: md5(password),
      })
      .lean();
    if (user) {
      const token = await tokenModel.create({
        token: uuid.v4(),
        userID: user._id,
      });

      if (token) {
        res.json({
          result: "success",
          resultData: { ...user },
          token: token.token,
        });
      } else {
        res.json({
          result: "failed",
        });
      }

      console.log("\x1b[32m%s\x1b[0m", email + " has succesfully sign in!");
    } else {
      res.json({ result: "not_found" });
      console.log("\x1b[31m%s", email, "is not in the database!", "\x1b[0m");
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

module.exports = router;
