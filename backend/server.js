const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//database models
const userModel = require("./models/user");
const tokenModel = require("./models/token");

//express routes
const home = require("./routes/home.js");
const labels = require("./routes/labels.js");
const technician = require("./routes/technician.js");
const location = require("./routes/location.js");
const qr = require("./routes/qr.js");
const user = require("./routes/user.js");
const rack = require("./routes/rack.js");
const logs = require("./routes/logs.js");
const products = require("./routes/products.js");

var morgan = require("morgan");
var fs = require("fs");
const chalk = require("chalk");

require("console-stamp")(console, {
  format: "(->).yellow :date().bold.black.bgRed",
});

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

  if (process.env.NODE_ENV == "production") {
    var accessLogStream = fs.createWriteStream("./access.log", { flags: "a" });
    app.use(
      morgan({
        format:
          "[:date[clf]] :remote-addr :method :url :status :response-time ms",
        stream: {
          write: function (str) {
            accessLogStream.write(str);
            console.log(str);
          },
        },
      })
    );
  } else {
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
  }

  app.use((req, res, next) => {
    if ("OPTIONS" === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use("/uploads", express.static(__dirname + "/uploads"));

  app.get("/", async (req, res) => {
    res.send("<h2 style = color:green>Listening port...</h2>");
  });

  app.use("/", qr);
  app.use("/", user);

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
  });

  app.use("/", home);
  app.use("/", labels);
  app.use("/", technician);
  app.use("/", location);
  app.use("/", rack);
  app.use("/", logs);
  app.use("/", products);

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
