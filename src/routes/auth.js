const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv/config")
const { OAuth2Client } = require("google-auth-library");

const GoogleClientID = process.env.GoogleClientID;

const client = new OAuth2Client(GoogleClientID);

let DB = [];

async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GoogleClientID,
        });
        return { payload: ticket.getPayload() };
    } catch (error) {
        return { error: "Invalid user detected. Please try again" };
    }
}

router.get("/signup/google", async (req, res) => {
    try {
        // console.log({ verified: verifyGoogleToken(req.body.credential) });
        if (req.body.credential) {
            const verificationResponse = await verifyGoogleToken(req.body.credential);

            if (verificationResponse.error) {
            return res.status(400).json({
                message: verificationResponse.error,
            });
        }

        const profile = verificationResponse?.payload;

        DB.push(profile);

        res.status(201).json({
            message: "Signup was successful",
            user: {
            firstName: profile?.given_name,
            lastName: profile?.family_name,
            picture: profile?.picture,
            email: profile?.email,
            token: jwt.sign({ email: profile?.email }, "myScret", {
                expiresIn: "1d",
            }),
            },
        });
        }
    } catch (error) {
        res.status(500).json({
        message: "An error occured. Registration failed.",
        });
    }
})

router.get("/login/google", async (req, res) => {
    try {
        if (req.body.credential) {
            const verificationResponse = await verifyGoogleToken(req.body.credential);
            if (verificationResponse.error) {
                return res.status(400).json({
                message: verificationResponse.error,
            });
        }

        const profile = verificationResponse?.payload;

        const existsInDB = DB.find((person) => person?.email === profile?.email);

        if (!existsInDB) {
            return res.status(400).json({
            message: "You are not registered. Please sign up",
            });
        }

        res.status(201).json({
            message: "Login was successful",
            user: {
                firstName: profile?.given_name,
                lastName: profile?.family_name,
                picture: profile?.picture,
                email: profile?.email,
                token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            }),
        },
    });
        }
    } catch (error) {
        res.status(500).json({
            message: error?.message || error,
        });
    }
})

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("http://localhost:3000/")
})

router.post("/login", (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    console.log(user);
    res.status(201).json({
        message: "Login was successful",
        user: {
            token: jwt.sign({
                firstName: "ten_test",
                lastName: "ho_test",
                picture: "url_test",
                email: "emal_test"}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        }),
    }});

})

router.post("/signup", (req, res) => {

})


module.exports = router