module.exports = routes = app => {
    app.use("/api/users", require("./users"));
    app.use("/api/home", require("./home"));
  };