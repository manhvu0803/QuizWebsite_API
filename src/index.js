const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./auth/passport");
const passport = require("passport");
const authRoute = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cookieSession(
    {
        name: "session",
        keys: ["spider"],
        maxAge: 24 * 60 * 60 * 1000 * 30
    }
))

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,POST,PUT,DELETE",
        credential: true
}))

app.use("/auth", authRoute)

app.listen("5000", () => {
    console.log("Server is running!")
})