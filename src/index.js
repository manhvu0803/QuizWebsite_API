const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
require("./auth/passport");
const passport = require('passport');
const { session } = require("passport");

async function main() {
    const getUserInfo = await import("./auth/user.mjs");
    const groupRoute = await import("./routes/group.mjs");
    const userRoute = await import("./routes/user.mjs");
    const authRoute = await import("./routes/auth.mjs");
    const presentationRoute = await import("./routes/presentation.mjs");
    const answerRotue = await import("./routes/answer.mjs");

    const app = express();

    const PORT = process.env.PORT || 5000;

    app.use(cookieSession(
        {
            name: "session",
            keys: ["spider"],
            maxAge: 24 * 60 * 60 * 1000 * 30,
            httpOnly: false
        }
    ))

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.json());

    app.use(
        cors({
            origin: "http://localhost:3000",
            methods: "GET,POST,PUT,DELETE",
            credentials: true
    }))

    app.use("/auth", authRoute.default);
    app.use("/group", passport.authenticate("jwt", {session: false}), getUserInfo.default, groupRoute.default);
    app.use("/user", passport.authenticate("jwt", {session: false}), getUserInfo.default, userRoute.default);
    app.use("/presentation", passport.authenticate("jwt", {session: false}), getUserInfo.default, presentationRoute.default);
    app.use("/answer", passport.authenticate("jwt", {session: false}), getUserInfo.default, answerRotue.default);

    app.listen("5000", () => {
        console.log("Server is running!")
    })
}

main();