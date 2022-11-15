require("./server/node_modules/dotenv/lib/main").config();
require("./config/database").connect();
const express = require("express");

const app = express();

app.use(express.json());

const User = require("./server/model/user");
const auth = require("./server/middleware/auth");

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome to FreeCodeCamp 🙌");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { cin, email, password } = req.body;

    if (!(email && password && cin)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedUserPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: encryptedUserPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );
    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { cin, password } = req.body;

    if (!(password && cin)) {
      res.status(400).send("All input is required");
    }

    encryptedUserPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      cin: cin,
      email: email.toLowerCase(),
      password: encryptedUserPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );
    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
