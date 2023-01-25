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
const locationModel = require("./models/location");
const rackModel = require("./models/rack");
const qrLogModel = require("./models/qrLog");

var path = require("path");
const uuid = require("uuid");
const md5 = require("md5");
const essentials = require("./utils/essentials");

var morgan = require("morgan");
const chalk = require("chalk");

require("console-stamp")(console, {
  format: "(->).yellow :date().bold.black.bgRed",
});

require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + "+" + Date.now() + path.extname(file.originalname));
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

  app.use(
    morgan(function (tokens, req, res) {
      return [
        "\n",
        chalk.hex("#ff4757").bold("🍄  Morgan --> "),
        chalk.hex("#34ace0").bold(tokens.method(req, res)),
        chalk.hex("#ffb142").bold(tokens.status(req, res)),
        chalk.hex("#ff5252").bold(tokens.url(req, res)),
        chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
        chalk.hex("#f78fb3").bold("@ " + tokens.date(req, res)),
        chalk.yellow(tokens["remote-addr"](req, res)),
        chalk.hex("#fffa65").bold("from " + tokens.referrer(req, res)),
        chalk.hex("#1e90ff")(tokens["user-agent"](req, res)),
        "\n",
      ].join(" ");
    })
  );

  app.use((req, res, next) => {
    if ("OPTIONS" === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use("/uploads", express.static(__dirname + "/uploads"));

  app.get("/", async (req, res) => {
    res.send("Listening the port...");
  });

  app.post("/qr", async (req, res) => {
    try {
      const { id } = req.body;
      const product = await productModel.findById(id);
      const host = req.protocol + "://" + req.get("host");

      if (product) {
        product.image = host + "/" + product.image;
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

  app.post("/qr/give", async (req, res) => {
    try {
      let {
        _id,
        count,
        parts,
        technician,
        wanted_count,
        price,
        new_location,
        target,
      } = req.body;

      target = target.toUpperCase();

      const result = await qrLogModel.create({
        itemID: _id,
        count,
        parts,
        technician,
        wanted_count,
        source: new_location,
        target,
      });
      if (result._id) {
        const productResult = await productModel.updateOne(
          { _id: _id },
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
          technician +
            " took " +
            wanted_count +
            " out of " +
            count +
            " " +
            parts +
            " from " +
            new_location +
            " to " +
            target +
            "!"
        );
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/qr/rack", async (req, res) => {
    try {
      const { _id } = req.body;
      const labels = await labelModel.find({});
      const locs = await locationModel.find({});
      const racks = await rackModel.find({ _id: _id });
      if (labels && locs && racks) {
        res.json({
          status: "success",
          labels: labels,
          locations: locs,
          racks: racks,
        });
        console.log("Retrieved datas!");
      } else {
        res.json({ status: "failed" });
        console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve datas!");
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/qr/rack/add", upload.single("file"), async (req, res) => {
    try {
      let {
        count,
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags,
      } = req.body;

      price = essentials.numberFormatToEU(price);
      const image = req.file.path;

      const result = await productModel.create({
        image,
        count,
        from_where,
        min_quantity,
        new_location,
        parts,
        price: price.toFixed(2),
        tags,
        total_price: (price * count).toFixed(2),
      });

      if (result._id) {
        console.log(req.socket.remoteAddress + " added " + parts + " product!");
        res.json({ result: "success", resultData: result });
      } else {
        res.json({ result: "failed" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
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
    require("dns").resolve("www.google.com", function (err) {
      if (err) {
        const txt = String.raw`

                       ______
                    .-"      "-.
                   /            \
       _          |              |          _
      ( \         |,  .-.  .-.  ,|         / )
       > "=._     | )(__/  \__)( |     _.=" <
      (_/"=._"=._ |/     /\     \| _.="_.="\_)
             "=._ (_     ^^     _)"_.="
                 "=\__|IIIIII|__/="
                _.="| \IIIIII/ |"=._
      _     _.="_.="\          /"=._"=._     _
     ( \_.="_.="     '--------'     "=._"=._/ )
      > _.="                            "=._ <
     (_/                                    \_)
        
     `;
        console.log("\x1b[31m%s\x1b[0m", txt);
        console.log("\x1b[31m%s\x1b[0m", "NO INTERNET CONNECTION");
      }
    });

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
      "/location" ||
      "/location/add" ||
      "/location/delete" ||
      "/location/update" ||
      "/rack" ||
      "/rack/add" ||
      "/rack/delete" ||
      "/rack/update" ||
      "/logs/technicians" ||
      "/logs/qr" ||
      "/order" ||
      "/order/step-up" ||
      "/order/transfer"
    ) {
      try {
        const token = req.header("Authorization");
        if (token) {
          const tokenData = await tokenModel
            .find({ token: token })
            .sort({ createdAt: -1 })
            .limit(1);

          if (!isEmpty(tokenData)) {
            console.log("\x1b[35m%s\x1b[0m", token + " will be authenticated!");
            var date = new Date();
            date.setHours(date.getHours() - 5);
            if (
              Math.abs(date - tokenData[0].createdAt) / (1000 * 60) >=
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
    const products = await productModel.find({ status: "INVENTORY" }, {});

    const host = req.protocol + "://" + req.get("host");
    for (let i = 0; i < products.length; i++) {
      products[i].image = host + "/" + products[i].image;
    }

    res.json({
      status: "success",
      records: { ...products },
      user: { ...req.user },
    });
  });

  app.post("/home/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id && (await essentials.deleteImage(id)) == 1) {
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

  app.post("/home/update", upload.single("file"), async (req, res) => {
    try {
      let {
        id,
        count,
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags,
      } = req.body;

      price = essentials.numberFormatToEU(price);
      from_where = from_where.toUpperCase();
      new_location = new_location.toUpperCase();
      parts = parts.toUpperCase();

      const pipeline = {
        count,
        from_where,
        min_quantity,
        new_location,
        parts,
        price: price.toFixed(2),
        tags,
        total_price: (price * count).toFixed(2),
      };
      if (req.file) {
        pipeline.image = req.file.path;
      }

      const isImageInPipeline = async () => {
        if (pipeline.image) {
          if ((await essentials.deleteImage(id)) == 1) {
            return true;
          } else {
            return false;
          }
        }
        return true;
      };

      if (isImageInPipeline() && id) {
        const result = await productModel.updateOne({ _id: id }, pipeline);
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
      let {
        id,
        count,
        parts,
        technician,
        wanted_count,
        price,
        new_location,
        target,
      } = req.body;
      price = essentials.numberFormatToEU(price);
      target = target.toUpperCase();
      const result = await technicianLogModel.create({
        itemID: id,
        userID: req.user[0]._id,
        count,
        parts,
        technician,
        wanted_count,
        source: new_location,
        target,
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
            " from " +
            new_location +
            " to " +
            target +
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
        from_where,
        min_quantity,
        new_location,
        parts,
        price,
        tags,
        status,
      } = req.body;

      price = essentials.numberFormatToEU(price);
      const image = req.file.path;

      const result = await productModel.create({
        image,
        count,
        from_where,
        min_quantity,
        new_location,
        parts,
        price: price.toFixed(2),
        tags,
        total_price: (price * count).toFixed(2),
        status,
      });

      if (result._id) {
        console.log(req.user[0].name + " added " + parts + " product!");
        res.json({ result: "success", resultData: result });
      } else {
        res.json({ result: "failed" });
      }
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

  app.post("/logs/technicians", async (req, res) => {
    let logs = await technicianLogModel.find({});
    if (logs) {
      let users = await userModel.find({});
      if (users) {
        res.json({
          status: "success",
          records: { logs: logs, users: users },
        });
        console.log("Retrieved technicians logs!");
      } else {
        res.json({ status: "failed" });
        console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve infos!");
      }
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technician logs!");
    }
  });

  app.post("/logs/qr", async (req, res) => {
    let logs = await qrLogModel.find({});
    if (logs) {
      res.json({
        status: "success",
        records: { logs: logs },
      });
      console.log("Retrieved QR logs!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve QR logs!");
    }
  });

  app.post("/location", async (req, res) => {
    /*const locs = await locationModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "location",
          foreignField: "new_location",
          as: "matched_docs",
        },
      },
      {
        $match: {
          matched_docs: { $eq: [] },
        },
      },
    ]);*/
    const locs = await locationModel.find({});
    if (locs) {
      res.json({
        status: "success",
        records: { ...locs },
      });
      console.log("Retrieved locations!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve locations!");
    }
  });

  app.post("/location/add", async (req, res) => {
    try {
      const { location, rack } = req.body;
      const result = await locationModel.create({
        location: location.toUpperCase(),
        rack: rack.toUpperCase(),
      });
      res.json(
        result._id
          ? { result: "success", resultData: result }
          : { result: "failed" }
      );
      console.log("Location " + location + " is written in the database");
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/location/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id) {
        const result = await locationModel.deleteOne({ _id: id });
        if (result.deletedCount != 0) {
          res.json({ status: "success" });
          console.log("\x1b[32m%s\x1b[0m", "Location deleted!");
        } else {
          res.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the location for deletion. ID of the location is " + id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for deletion of location!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/location/update", async (req, res) => {
    try {
      const { _id, location, rack } = req.body;

      if (_id) {
        const result = await locationModel.updateOne(
          { _id: _id },
          { location: location.toUpperCase(), rack: rack.toUpperCase() }
        );
        if (result.modifiedCount != 0) {
          console.log("\x1b[32m%s\x1b[0m", "Location updated!");
          res.json({ status: "success" });
        } else {
          res.json({ status: "failed" });

          console.log(
            "\x1b[31m%s\x1b[0m",
            req.user[0].name +
              " didn't update the location. ID of the location is " +
              _id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for updating location!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/rack", async (req, res) => {
    const racks = await rackModel.find({});
    if (racks) {
      res.json({
        status: "success",
        records: { ...racks },
      });
      console.log("Retrieved racks!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve racks!");
    }
  });

  app.post("/rack/add", async (req, res) => {
    try {
      const { rack } = req.body;
      const result = await rackModel.create({
        rack: rack.toUpperCase(),
      });
      res.json(
        result._id
          ? { result: "success", resultData: result }
          : { result: "failed" }
      );
      console.log("Rack " + rack + " is written in the database");
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/rack/delete", async (req, res) => {
    try {
      const id = req.body.id;
      if (id) {
        const result = await rackModel.deleteOne({ _id: id });
        if (result.deletedCount != 0) {
          res.json({ status: "success" });
          console.log("\x1b[32m%s\x1b[0m", "Rack deleted!");
        } else {
          res.json({ status: "failed" });
          console.log(
            "\x1b[31m%s\x1b[0m",
            "Didn't find the rack for deletion. ID of the rack is " + id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for deletion of rack!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/rack/update", async (req, res) => {
    try {
      const { _id, rack } = req.body;

      if (_id) {
        const result = await rackModel.updateOne(
          { _id: _id },
          { rack: rack.toUpperCase() }
        );
        if (result.modifiedCount != 0) {
          console.log("\x1b[32m%s\x1b[0m", "Rack updated!");
          res.json({ status: "success" });
        } else {
          res.json({ status: "failed" });

          console.log(
            "\x1b[31m%s\x1b[0m",
            req.user[0].name +
              " didn't update the rack. ID of the rack is " +
              _id
          );
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't get the reguest for updating rack!"
        );
        res.json({ status: "request_error" });
      }
    } catch (e) {
      res.json({ error: e });
      console.log(e);
    }
  });

  app.post("/order", async (req, res) => {
    console.log("Request to orders list ..");
    const products = await productModel.find(
      { status: { $ne: "INVENTORY" } },
      {}
    );

    const host = req.protocol + "://" + req.get("host");
    for (let i = 0; i < products.length; i++) {
      products[i].image = host + "/" + products[i].image;
    }

    res.json({
      status: "success",
      records: { ...products },
    });
  });

  app.post("/order/step-up", async (req, res) => {
    try {
      const { _id, status } = req.body;
      const result = await productModel.updateOne(
        { _id: _id },
        { status: status }
      );
      if (result.modifiedCount != 0) {
        console.log(req.user[0].name + " stepped up " + _id + " to " + status);
        res.json({ result: "success" });
      } else {
        res.json({ result: "failed" });
        console.log("Nothing changed about stepping up!");
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  });

  app.post("/order/transfer", async (req, res) => {
    try {
      const { id, values } = req.body;
      const result = await productModel.updateOne(
        { _id: id },
        { ...values, status: "INVENTORY" }
      );
      console.log({ ...values, status: "INVENTORY" });
      if (result.modifiedCount != 0) {
        console.log(req.user[0].name + " transfered the order");
        res.json({ result: "success" });
      } else {
        console.log("Something went wrong while transfering the order!");
        res.json({ result: "failed" });
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
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
    console.log("\x1b[34m%s\x1b[0m", "Listening on port " + process.env.PORT);
  });
});
