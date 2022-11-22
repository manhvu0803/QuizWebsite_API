const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");


router.get("/login/success", (req, res) => {
    if(req.user){
        const accessToken = jwt.sign(req.user, "jwt",
            { expiresIn: '30d'}
        )
        res.status(200).json({accessToken});
    }
})

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure"
    })
})

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("http://localhost:3000/")
})

router.get("/google", passport.authenticate("google", {scope: ["profile"]}));

router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3000/",
    failureRedirect: "/login/failed"
}))

module.exports = router