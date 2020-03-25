const redisService = require("../services/redis");

const welcome = (req, res) => {
        res.json("Hola");
  };

const welcomeAuth = (req, res) => {
    res.json("Hola, pero estás logueado");
  };

  module.exports = {
    welcome,
    welcomeAuth
  };