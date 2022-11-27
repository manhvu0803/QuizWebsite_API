const passport = require("passport");
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "letsplay"
};
require("dotenv/config");


const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new JwtStrategy(jwtOptions,  function(jwt_payload, done) {
    done(null, jwt_payload);
}));

passport.serializeUser((user, done) =>{
    done(null, user)
})

passport.deserializeUser((user, done) =>{
    done(null, user)
})