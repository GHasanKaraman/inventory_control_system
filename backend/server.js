const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const userModel = require("./models/user");
const tokenModel = require("./models/token");
const productModel = require("./models/product");
const labelModel = require("./models/label");
const technicianModel = require("./models/technician");
const technicianLogModel = require("./models/technicianLog");
var path = require("path");
const uuid = require("uuid");
const md5 = require("md5");
const essentials = require("./utils/essentials");

require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["images/jpeg", "images/jpg", "images/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//const upload = multer({ storage, fileFilter });
const upload = multer({ dest: "uploads/", storage: storage });
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

  app.post("/qr", async (req, res) => {
    try {
      const { id } = req.body;
      const product = await productModel.findById(id);
      if (product) {
        const techs = await technicianModel.find({});
        if (techs) {
          res.json({
            result: "success",
            resultData: product,
            records: { ...techs },
          });
          console.log("Retrieved technicians!");
        } else {
          res.json({ result: "failed", resultData: "technicians_retrieve" });
          console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technicians!");
        }
      } else {
        res.json({ result: "failed", resultData: "product_not_found" });
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
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
      "/home/update" ||
      "/home/delete" ||
      "/home/give" ||
      "/home/print" ||
      "/labels" ||
      "/labels/add" ||
      "/labels/delete" ||
      "/labels/update" ||
      "/items" ||
      "/technician" ||
      "/technician/add" ||
      "/technician/delete" ||
      "/technician/update" ||
      "/logs" ||
      "/qr"
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
              if (user) {
                req.user = user;
                console.log(
                  "\x1b[32m%s\x1b[0m",
                  user[0].name + " has been succesfully authenticated!"
                );
                next();
              } else {
                console.log("\x1b[31m%s\x1b[0m", "User not found!");
                res.json({ status: "user_not_found" });
              }
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
    const products = await productModel.find({}, {});
    res.json({
      status: "success",
      records: { ...products },
      user: { ...req.user },
    });
  });

  app.post("/home/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id) {
        const result = await productModel.deleteOne({ _id: id });
        if (result.deletedCount != 0) {
          res.json({ status: "success" });
          console.log("\x1b[32m%s\x1b[0m", "Item deleted!");
        } else {
          res.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the item for deletion. ID of the item is " + id
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

  app.post("/home/update", async (req, res) => {
    try {
      let {
        id,
        count,
        fishbowl,
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags,
      } = req.body;

      let temp = "";
      tags.forEach((element) => {
        temp += element + ",";
      });
      tags = temp.substring(0, temp.length - 1);

      price = essentials.numberFormatToEU(price);
      fishbowl = fishbowl.toUpperCase();
      from_where = from_where.toUpperCase();
      new_location = new_location.toUpperCase();
      parts = parts.toUpperCase();

      if (id) {
        const result = await productModel.updateOne(
          { _id: id },
          {
            count,
            fishbowl,
            from_where,
            min_quantity,
            new_location,
            parts,
            price: price.toFixed(2),
            tags,
            total_price: (price * count).toFixed(2),
          }
        );
        if (result.modifiedCount != 0) {
          console.log("\x1b[32m%s\x1b[0m", "Item updated!");
          res.json({ status: "success" });
        } else {
          res.json({ status: "failed" });

          console.log(
            "\x1b[31m%s\x1b[0m",
            req.user[0].name +
              " didn't update the item. ID of the item is " +
              id
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

  app.post("/home/give", async (req, res) => {
    try {
      let { id, count, parts, technician, wanted_count, price } = req.body;
      price = essentials.numberFormatToEU(price);
      const result = await technicianLogModel.create({
        itemID: id,
        userID: req.user[0]._id,
        count,
        parts,
        technician,
        wanted_count,
      });
      if (result._id) {
        const productResult = await productModel.updateOne(
          { _id: id },
          {
            count: count - wanted_count,
            total_price: ((count - wanted_count) * price).toFixed(2),
          }
        );

        res.json(
          result._id && productResult.modifiedCount != 0
            ? { result: "success", resultData: result }
            : { result: "failed" }
        );
        console.log(
          req.user[0].name +
            " gave " +
            wanted_count +
            " out of " +
            count +
            " " +
            parts +
            " to " +
            technician +
            "!"
        );
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/home/print", async (req, res) => {
    const data = req.body;
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
          res.json({ status: "failed" });

          console.log(
            "\x1b[31m%s\x1b[0m",
            req.user[0].name +
              " didn't update the label. ID of the label is " +
              _id
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

  app.post("/items", upload.single("file"), async (req, res) => {
    try {
      let {
        count,
        fishbowl,
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags,
      } = req.body;

      price = essentials.numberFormatToEU(price);

      console.log(
        count,
        fishbowl,
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags
      );

      /*
      const result = await productModel.create({
        count,
        fishbowl,
        from_where,
        min_quantity,
        new_location,
        parts,
        price: price.toFixed(2),
        tags,
        total_price: (price * count).toFixed(2),
      });

      if (result._id) {
        console.log(req.user[0].name + " added " + parts + " product!");
        res.json({ result: "success", resultData: result });
      } else {
        res.json({ result: "failed" });
      }
      */
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/technician", async (req, res) => {
    const techs = await technicianModel.find({});
    if (techs) {
      res.json({
        status: "success",
        records: { ...techs },
      });
      console.log("Retrieved technicians!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technicians!");
    }
  });

  app.post("/technician/add", async (req, res) => {
    try {
      const { name } = req.body;
      const result = await technicianModel.create({
        name: name.toUpperCase(),
      });
      res.json(
        result._id
          ? { result: "success", resultData: result }
          : { result: "failed" }
      );
      console.log("Technician " + name + " is written in the database");
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/technician/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id) {
        const result = await technicianModel.deleteOne({ _id: id });
        if (result.deletedCount != 0) {
          res.json({ status: "success" });
          console.log("\x1b[32m%s\x1b[0m", "Technician deleted!");
        } else {
          res.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the technician for deletion. ID of the technician is " +
              id
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

  app.post("/technician/update", async (req, res) => {
    try {
      const { _id, name } = req.body;

      if (_id) {
        const result = await technicianModel.updateOne(
          { _id: _id },
          { name: name.toUpperCase() }
        );
        if (result.modifiedCount != 0) {
          console.log("\x1b[32m%s\x1b[0m", "Technician updated!");
          res.json({ status: "success" });
        } else {
          res.json({ status: "failed" });

          console.log(
            "\x1b[31m%s\x1b[0m",
            req.user[0].name +
              " didn't update the technician. ID of the technician is " +
              _id
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

  app.post("/logs", async (req, res) => {
    let logs = await technicianLogModel.find({});
    if (logs) {
      let users = await userModel.find({});
      if (users) {
        res.json({
          status: "success",
          records: { logs: logs, users: users },
        });
        console.log("Retrieved logs!");
      } else {
        res.json({ status: "failed" });
        console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve infos!");
      }
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve logs!");
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
