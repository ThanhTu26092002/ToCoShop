// import { COLLECTION_LOGINS } from "../configs/constants";
const {
  COLLECTION_LOGINS,
  COLLECTION_EMPLOYEES,
} = require("../configs/constants");
const { ObjectId } = require("mongodb");

// import { findDocument } from "../utils/MongodbHelper";
const { findDocument, findDocuments } = require("../utils/MongodbHelper");

const passport = require("passport");
const jwt = require("jsonwebtoken");
// CHECK ROLES
const allowRoles = (...roles) => {
  //return a middleware
  return (req, res, next) => {
    //GET BEARER TOKEN FROM HEADER
    const bearerToken = req.get("Authorization").replace("Bearer ", "");
    //DECODE TOKEN
    const payload = jwt.decode(bearerToken, { json: true });
    //AFTER DECODE: GET UID FROM PAYLOAD
    const { uid } = payload;
    // FINDING BY ID
    findDocument(uid, COLLECTION_LOGINS).then((document) => {
      console.log(document);
      if (document && document.roles) {
        let ok = false;
        document.roles.forEach((role) => {
          if (roles.includes(role)) {
            ok = true;
            return;
          }
        });
        if (ok) {
          next();
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    });
  };
};

const exceptionAllowRoles = (...roles) => {
  //return a middleware
  return (req, res, next) => {
    const { id } = req.params;

    //GET BEARER TOKEN FROM HEADER
    const bearerToken = req.get("Authorization").replace("Bearer ", "");
    //DECODE TOKEN
    const payload = jwt.decode(bearerToken, { json: true });
    //AFTER DECODE: GET UID FROM PAYLOAD
    const { uid, email } = payload;
    // FINDING BY ID
    findDocument(uid, COLLECTION_LOGINS).then((document) => {
      if (document && document.roles) {
        let ok = false;
        document.roles.forEach((role) => {
          if (roles.includes(role)) {
            ok = true;
            return;
          }
        });
        if (ok) {
          next()
        } else {
          //Ki????m tra d????a va??o email t???? payload ?????? truy v????n t????i d???? li????u employees, ki????m tra s???? tru??ng l????p id, n????u tru??ng thi?? cho phe??p chi??nh s????a th??ng tin ca?? nh??n
          findDocuments({ query: { email: email } }, COLLECTION_EMPLOYEES).then(
            (employee) => {
              if (employee.length >0 && (String(employee[0]._id) === String(id))) {
                next();
                return;
              } else {
                res.status(403).json({ message: "Forbidden" });
              }
            }
          );
        }
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    });
  };
};


const checkLogin = (...roles) => {
  //return a middleware
  return (req, res, next) => {
    const { id } = req.params;

    //GET BEARER TOKEN FROM HEADER
    const bearerToken = req.get("Authorization").replace("Bearer ", "");
    //DECODE TOKEN
    const payload = jwt.decode(bearerToken, { json: true });
    //AFTER DECODE: GET UID FROM PAYLOAD
    const { uid } = payload;
    if(String(uid)===String(id)){
      console.log('ok api')
      next();
      return
    }
    // FINDING BY ID
    findDocument(uid, COLLECTION_LOGINS).then((document) => {
      console.log(document);
      if (document && document.roles) {
        let ok = false;
        document.roles.forEach((role) => {
          if (roles.includes(role)) {
            ok = true;
            return;
          }
        });
        if (ok) {
          next();
        } else {
          res.status(403).json({ message: "Forbidden" });
        }
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    });
  };
};

module.exports = { allowRoles, exceptionAllowRoles, checkLogin };
