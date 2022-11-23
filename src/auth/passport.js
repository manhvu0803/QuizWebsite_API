const passport = require("passport");
const passportJWT = require('passport-jwt');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "letsplay"
};

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const GoogleClientID = "490188826337-vbtolkjd99b42pdue64gmud9to62jn8l.apps.googleusercontent.com";
const GoogleClientSecret = "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";

// passport.use(new JwtStrategy(jwtOptions,  function(jwt_payload, done) {
//     console.log('payload received', jwt_payload);
//     var user = getUser({ id: jwt_payload.id });
//     if (user) {
//         return done(null, user);
//     } else {
//         return done(null, false);
//     }
// }));

passport.use(new GoogleStrategy({
    clientID: GoogleClientID,
    clientSecret: GoogleClientSecret,
    callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done){
        done(null, profile)
    }
));

passport.serializeUser((user, done) =>{
    done(null, user)
})

passport.deserializeUser((user, done) =>{
    done(null, user)
})