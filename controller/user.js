const db = require("../config/config_mysql");
const crypto = require("crypto");
const util = require("../helper/util");
const redisService = require("../services/redis");
const nodemailer = require("nodemailer");

// POST by body. This function add a new user in the data base with his password hashed.

const register = (req, res) => {
  const { mail, pass } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(pass)
    .digest("hex");

  const sql = `INSERT INTO users (mail, pass) VALUES (?,?);`;
  db.query(sql, [mail, hashedPassword], function(err, results) {
    if (err) {
      res.status(500).send("Internal error");
      throw err;
    }
    if (results && !results.affectedRows) {
      return res.status(400).send("Couldn't register the user");
    }

    res.status(200).json({ mail: mail});
  });
};

// const getLoggedUser = (req, res) => {
//   if (!req.session) {
//     return res.status(400).send("Not logged session detected");
//   }
//   const user = req.session;
//   user.pass = undefined;
//   res.json(user);
// };

const getLoggedUser = (req, res) => {
  redisService.get(`TOKEN_${req.session.token}`, (err, results) => {
    if (err) {
      return res.status(500).send("Internal Server Error.");
    }
    if (!results) {
      // 0 or 1
      return res.status(400).send("Can't Retrieve data");
    }
    const { id, username } = JSON.parse(results);
    res.json({ id, username });
  });
};

const login = (req, res) => {
  const { mail, pass } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(pass)
    .digest("hex");

  const sql = `SELECT id, mail, pass FROM users WHERE mail=? AND pass =?;`;
  db.query(sql, [mail, hashedPassword], function(err, results) {
    if (err) {
      res.status(500).send("Internal error");
      throw err;
    }

    if (results && !results.length) {
      return res.status(400).send("Wrong Mail/Password Combination");
    }
    const token = util.generateString(28);
    const result = results[0];

    redisService.insert(`TOKEN_${token}`, JSON.stringify(result), 3000, err => {
      if (err) {
        return res.status(500).send(false);
      }
      const resp = {
        user: {
          id: result.id,
          mail: result.mail
        },
        access_token: token
      };

      res.send(resp);
    });
  });
};

const logout = (req, res, next) => {
  const { token } = req.body;

  redisService.delete(`TOKEN_${token}`, (err, results) => {
    if (err) {
      return res.status(500).send("Internal Server Error.");
    }
    if (!results) {
      // 0 or 1
      return res.status(400).send("Logout failed");
    }

    return res.status(200).end("Logged out Successfully");
  });
};

const updatePassword = (req, res) => {
  const { newPassword, id } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(newPassword)
    .digest("hex");

  const sql = `UPDATE users SET pass = ? WHERE id=? ;`;
  db.query(sql, [hashedPassword, id], function(err, results) {
    if (err) {
      res.status(500).send("Internal error");
      throw err;
    }
    if (results && !results.affectedRows) {
      return res.status(400).send("Couldn't update the password");
    }

    res.status(200).send("Password was updated");
  });
};

const sendMail = (req, res) => {
  const { mail } = req.body;
  const resetCode = util.generateString(28);

  redisService.insert(`RESET_${resetCode}`, mail, 600, err => {
    //10 minutes to caducate
    if (err) {
      return res
        .status(500)
        .json({ msg: "Redis error while saving the reset code", ok: false, err: err });
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    const mailDetails = {
      from: process.env.MAIL_USER,
      to: mail,
      subject: `Hi ${mail}, this is your reset password code!`,
      html: `<p>Your reset code is:</br>${resetCode}.</br></br>
      Please note that it can be used only in the next 10 minutes. 
      </br></br></br>
      Have a nice day!
      </p>`
    };

    transporter.sendMail(mailDetails, (err, info) => {
      if (err) {
        console.log(err);
        
        return res
          .status(500)
          .json({ msg: "Error trying to send reset code", ok: false, err: err });
      }

      return res.json({ msg: "E-mail with reset code sent successfully!", ok: true });
    });
  });
};


module.exports = {
  register,
  getLoggedUser,
  login,
  logout,
  updatePassword,
  sendMail
};