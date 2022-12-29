const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userModel = require("./models/user");
const tokenModel = require("./models/token");
const productModel = require("./models/product");
const labelModel = require("./models/label");

const uuid = require("uuid");
const md5 = require("md5");

require("dotenv").config();

const app = express();
mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://inventory:rNWsMsyxsVEXHFsw@cluster0.zjjva5g.mongodb.net/inventory",
  { useNewUrlParser: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    if ("OPTIONS" === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.get("/", async (req, res) => {
    res.send("Listening the port...");
  });

  app.post("/register", async (req, res) => {
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

  app.post("/login", async (req, res) => {
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

  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  app.use(async (req, res, next) => {
    if (
      req.url == "/home" ||
      "/labels" ||
      "/labels/add" ||
      "/labels/delete" ||
      "/labels/update"
    ) {
      try {
        const token = req.header("Authorization");
        if (token) {
          console.log("\x1b[35m%s\x1b[0m", token + " will be authenticated!");
          const tokenData = await tokenModel
            .find({ token: token })
            .sort({ createdAt: -1 })
            .limit(1);

          if (!isEmpty(tokenData)) {
            if (
              Math.abs(new Date() - tokenData[0].createdAt) / (1000 * 60) >=
              60 * 24
            ) {
              console.log(
                "\x1b[31m%s\x1b[0m",
                token + " has expired! User should sign in again!"
              );
              res.json({ status: "token_expired" });
            } else {
              const user = await userModel.find({ _id: tokenData[0].userID });
              req.user = user;
              next();
              console.log(
                "\x1b[32m%s\x1b[0m",
                user[0].name + " has been succesfully authenticated!"
              );
            }
          } else {
            console.log(
              "\x1b[31m%s\x1b[0m",
              "Token is not valid. User should sign in again!"
            );
            res.json({ status: "token_error" });
          }
        } else {
          console.log(
            "\x1b[31m%s",
            token,
            "is not authenticated! User should sign in!",
            "\x1b[0m"
          );
          res.json({ status: "token_error" });
        }
      } catch (e) {
        req.user = null;
        res.json({ error: e });
        console.log(e);
      }
    }
  });

  app.post("/home", async (req, res) => {
    console.log("Request to loading table...");
    const products = await productModel.find({}, { _id: 0 });
    res.json({
      status: "success",
      records: { ...products },
      user: { ...req.user },
    });
  });

  app.post("/labels", async (req, res) => {
    let labels = await labelModel.find({});
    if (labels) {
      res.json({
        status: "success",
        records: { ...labels },
      });
      console.log("Retrieved labels!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve labels!");
    }
  });

  app.post("/labels/add", async (req, res) => {
    try {
      const { label, color } = req.body;
      const result = await labelModel.create({
        name: label.toString().toUpperCase(),
        color,
      });
      res.json(
        result._id
          ? { result: "success", resultData: result }
          : { result: "failed" }
      );
      console.log(label + " is written in the database");
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/labels/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id) {
        const result = await labelModel.deleteOne({ _id: id });
        if (result.deletedCount != 0) {
          res.json({ status: "success" });
          console.log("\x1b[32m%s\x1b[0m", "Label deleted!");
        } else {
          res.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the label for deletion. ID of the label is " + id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for deletion!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/labels/update", async (req, res) => {
    try {
      const { _id, name, color } = req.body;

      if (_id) {
        const result = await labelModel.updateOne(
          { _id: _id },
          { name: name.toUpperCase(), color: color }
        );

        if (result.modifiedCount != 0) {
          console.log("\x1b[32m%s\x1b[0m", "Label updated!");
          res.json({ status: "success" });
        } else {
          es.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the label for update. ID of the label is " + id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for updating!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.listen(process.env.PORT, (req, res) => {
    var txt = encodeURIComponent(
      `
     ___                      _                     ____                           
    |_ _|_ ____   _____ _ __ | |_ ___  _ __ _   _  / ___|  ___ _ ____   _____ _ __ 
     | || '_ \\ \\ / / _ \\ '_ \\| __/ _ \\| '__| | | | \\___ \\ / _ \\ '__\\ \\ / / _ \\ '__|
     | || | | \\ V /  __/ | | | || (_) | |  | |_| |  ___) |  __/ |   \\ V /  __/ |   
    |___|_| |_|\\_/ \\___|_| |_|\\__\\___/|_|   \\__, | |____/ \\___|_|    \\_/ \\___|_|   
                                            |___/                                  
    `
    );
    txt = decodeURIComponent(txt);
    console.log("\x1b[35m%s\x1b[0m", txt);
    console.log(
      "\x1b[33m%s\x1b[0m",
      "mongo connection established successfully!"
    );
    console.log("\x1b[34m%s", "Listening on port", process.env.PORT, "\x1b[0m");
  });
});
