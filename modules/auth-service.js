require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: String,
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;

const Initialize = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

const registerUser = (userData) => {
  let { password, password2 } = userData;
  return new Promise(async (resolve, reject) => {
    if (password != password2) reject("Passwords do not match");
    let newUser = new User(userData);

    try {
      const hash = await bcrypt.hash(password, 10);
      newUser.password = hash;
    } catch (err) {
      reject(`There was an error encrypting the password`);
    }

    try {
      await newUser.save();
      resolve();
    } catch (err) {
      if (err.code == 11000) reject("User Name already taken");
      reject(`There was an error creating the user: ${err}`);
    }
  });
};

const checkUser = (userData) => {
  let { userName, userAgent, password } = userData;

  return new Promise(async (resolve, reject) => {
    try {
      let users = await User.find({ userName: userName }).exec();

      if (users.length === 0) reject(`Unable to find user: ${userName}`);
      let user = users[0];

      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) reject(`Incorrect password for user: ${userName}`);
      } catch (err) {
        reject(`There was an error comparing the passwords: ${err}`);
      }

      if (user.loginHistory.length == 8) {
        user.loginHistory.pop();
      }

      user.loginHistory.unshift({
        dateTime: new Date().toString(),
        userAgent: userAgent,
      });

      try {
        await User.updateOne(
          { userName: user.userName },
          {
            $set: { loginHistory: user.loginHistory },
          }
        );
      } catch (err) {
        reject(`There was an error verifying the user: ${err}`);
      }

      resolve(user);
    } catch (err) {
      reject(`Unable to find the user: ${userName}`);
    }
  });
};

module.exports = {
  Initialize,
  registerUser,
  checkUser,
};
