require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const BasicStrategy = require("passport-http").BasicStrategy;

const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const loggerFile = require("./v1/utils/logger");
const { v4: uuid } = require("uuid");
const { COLLECTION_LOGINS } = require("./v1/configs/constants");
const { findDocuments, findDocument } = require("./v1/utils/MongodbHelper");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  cors({
    // origin: 'http://127.0.0.1:5500/'
    origin: "*",
    //  methods: ['POST', 'GET']
  })
);



//Passport: Basic Auth
passport.use( new BasicStrategy(function(username, password, done) {
  console.log('\n BasicStrategy \n');
  findDocuments({query: {email: username, password}}, COLLECTION_LOGINS)
  .then(result =>{
    if(result.length > 0){
      return done(null, true);
    }else {
      return done(null, false);
    }
  })
  .catch(err =>{
    return done(err, false);
  })
}))
//
// Passport: Bearer Token

const opts = {};
//extract content gui len tu client
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//ma tu minh nghi ra--ma bao mat ma chi phia server la biet thoi-- duoc dung de bam du lieu
opts.secretOrKey =  process.env.JWT_SETTING_SECRET;
// issuer. audience- minh viet API cho he thong di dong,...-- thong tin them
opts.issuer =process.env.JWT_SETTING_ISSUER;
opts.audience = process.env.JWT_SETTING_AUDIENCE;
//Cai dat mot middle ware

passport.use(
  new JwtStrategy(opts, function (payload, done) {
    console.log("\n🚀 JwtStrategy ... 🚀\n");
    const _id = payload.uid;
    findDocument(_id, COLLECTION_LOGINS)
      .then((result) => {
        if (result) {
          return done(null, result);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);

const MONGO_URL = process.env.MONGO_URL;
mongoose
  .connect(MONGO_URL, {
    // serverSelectionTimeoutMS: 3000,
  })
  .then(
    (result) => console.log("info", "Database connection Success")

    // loggerFile.log('info',"Database connection Success")
  )
  .catch(
    (err) => console.log("error", `Database connection failed: ${err}`)
    // loggerFile.log('error', `Database connection failed: ${err}`)
  );

//user middleware
app.use(
  helmet()
  //   {
  //   crossOriginResourcePolicy: false,
  // }
);
app.use(morgan("combined"));

//router
app.use("/v1", require("./v1"));

//Error Handling Middleware called

app.use((req, res, next) => {
  const error = new Error("Not found!");
  error.status = 404;
  next(error);
});

//error handler middleware

app.use((error, req, res, next) => {
  console.log(
    "error",
    `${uuid()}----${req.url}-----${req.method}-----${error.message}`
  );
  // loggerFile.log('error', `${uuid()}----${req.url}-----${req.method}-----${error.message}`);
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    },
  });
});

module.exports = app;
