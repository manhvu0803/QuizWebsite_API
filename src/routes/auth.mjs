import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";
import * as db from "../database/userDatabase.mjs";
import { v4 } from "uuid"
import { getClientId, getUsername, sendData, sendError, getAvatarUrl, getDisplayName } from "./routeUtils.mjs"
import { sendConfirmationEmail, sendResetEmail } from "../mailer.js";
import RandExp from "randexp";

const GoogleClientID = process.env.GoogleClientID;

const client = new OAuth2Client(GoogleClientID);

const router = express.Router();

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

// router.post("/signup/google", async (req, res) => {
//     try {
//         // console.log({ verified: verifyGoogleToken(req.body.credential) });
//         if (req.body.credential) {
//             const verificationResponse = await verifyGoogleToken(req.body.credential);

//             if (verificationResponse.error) {
//             return res.status(400).json({
//                 message: verificationResponse.error,
//             });
//         }

//         const profile = verificationResponse?.payload;

//         DB.push(profile);

//         res.status(201).json({
//             message: "Signup was successful",
//             user: {
//             firstName: profile?.given_name,
//             lastName: profile?.family_name,
//             picture: profile?.picture,
//             email: profile?.email,
//             token: jwt.sign({ email: profile?.email }, "myScret", {
//                 expiresIn: "1d",
//             }),
//             },
//         });
//         }
//     } catch (error) {
//         res.status(500).json({
//         message: "An error occured. Registration failed.",
//         });
//     }
// })

router.post("/login/google", async (req, res) => {
    try {
        if (req.body.credential) {
            const verificationResponse = await verifyGoogleToken(req.body.credential);
            if (verificationResponse.error) {
                return res.status(400).json({
                message: verificationResponse.error,
            });
        }

        const profile = verificationResponse?.payload;

        const user = await db.getUser(profile.sub);

        let clientId = req.body.clientId;

        if (!user) {
            try {
                await db.addUser({
                    email: profile.email,
                    username: profile.sub,
                    password: '123',
                    displayName: profile.name,
                    age: null,
                    avatarUrl: profile.picture,
                    active: profile.email_verified ? 1 : 0
                });

                let token = await db.getToken(clientId, "clientId");

                if (!token) {
                    token = random();
                }

                await db.addToken(token, clientId, profile.sub);
            }
            catch (err) {
                sendError(res, err);
                return;
            }
        }

        if(profile.email_verified)
            sendData(res, {
                accessToken: jwt.sign({
                        name: profile.sub,
                        email: profile.email,
                        displayName: profile.name,
                        age: null,
                        avatar: profile.picture,
                        clientId: clientId
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                )
            });
            return;
            }
        else{
            await sendConfirmationEmail({toUser: {email: query.email, username: username}, hash: token});

            res.status(400).json({
                success: false,
                isActive: false
            })
            return;
        }
    } catch (error) {
        res.status(500).json({
            message: error?.message || error,
        });
    }
})

router.get("/register", async (req, res) => {
    let query = req.query;
    let error = null;
    let username = getUsername(query);

    let user = await db.getUser(username);
    if (user) {
        error = "Username has been used";
    }
    error = null;

    user = await db.getUser(query.email, "email");
    if (user) {
        error = "Email has been used";
    }

    if (error) {
        sendError(res, error);
        return;
    }

    try {
        await db.addUser({
            email: query.email,
            username: username,
            password: query.password,
            displayName: getDisplayName(query),
            age: query.age,
            avatarUrl: getAvatarUrl(query),
            active: 0
        });

        // let clientId = getClientId(query);
        // let token = await db.getToken(clientId, "clientId");

        // if (!token) {
        //     token = random();
        // }

        // await db.addToken(token, clientId, username);

        await sendConfirmationEmail({toUser: {email: query.email, username: username}, hash: null});

        sendData(res, "success");
    }
    catch (err) {
        sendError(res, err);
    }
});

function random(min = 1000000000, max = 10000000000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

router.get("/login", async (req, res) => {
    let query = req.query;
    let token = query.token ?? query.accessToken;

    let user = null;

    let clientId = v4();

    if (token) {
        let tokenInfo = await db.getToken(token);
        user = await db.getUser(tokenInfo.user);

        console.log(user);

        if (user && user.active === 1) {
            sendData(res, {
                accessToken: jwt.sign({
                        username: user.username,
                        clientId: clientId
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                )
            });
            return;
        }
        else if (user){
            res.status(400).json({
                success: false,
                isActive: false
            })
            return;
        }
    }

    let username = getUsername(query);
    if (username) {
        user = await db.getUser(username);
    }

    if (!user && query.email) {
        user = await db.getUser(query.email, "email");
    }

    if (!user) {
        sendError(res, "User doesn't exist");
        return;
    }

    if (user.password != query.password) {
        sendError(res, "Wrong password");
        return;
    }

    // if(user.active === 0){
    //     res.status(400).json({
    //         success: false,
    //         isActive: false
    //     })
    //     return;
    // }

    token = await db.getToken(getClientId(query), "clientId");

    if (!token) {
        token = {
            accessToken: random(),
            clientId: clientId
        }

        await db.addToken(token.accessToken, clientId, username);
    }

    sendData(res, {
        accessToken: jwt.sign({
            username: user.username,
            clientId: clientId
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )});
});


router.get("/active", async (req, res) => {
    let query = req.query;

    let user = null;
    let username = getUsername(query);
    if (username) {
        user = await db.getUser(username);
    }
    else{
        sendError(res, "Cannot activate!");
        return;
    }

    if(!user){
        sendError(res, "Error!");
        return;
    }

    try {
		await db.updateUser(query.username, {active: 1})
        sendData(res, "Activated");
	}
	catch (err) {
        sendError(res, err);
	}
})

router.get("/active_email", async (req, res) => {
    let query = req.query;

    let user = null;
    let username = getUsername(query);
    if (username) {
        user = await db.getUser(username);
    }
    else{
        sendError(res, "Cannot activate!");
        return;
    }

    if(!user){
        sendError(res, "Error!");
        return;
    }

    try {
		await sendConfirmationEmail({toUser: {email: user.email, username: username}, hash: null});
        sendData(res, "Email sent");
	}
	catch (err) {
        sendError(res, err);
	}
})

// router.get("/reset", async (req, res) => {
//     let query = req.query;

//     let user = null;
//     let username = getUsername(query);
//     if (username) {
//         user = await db.getUser(username);
//     }
//     else{
//         sendError(res, "Cannot Reset password");
//         return;
//     }

//     if(!user){
//         sendError(res, "Error!");
//         return;
//     }

//     sendData(res, "Email sent!");
// });

router.get("/resetPass", async (req, res) => {
    let query = req.query;

    let user = null;
    let username = getUsername(query);
    // let password = req.query.password;

    if (username) {
        user = await db.getUser(username);
    }
    else{
        sendError(res, "Cannot Reset password");
        return;
    }

    if(!user){
        sendError(res, "Error!");
        return;
    }

    try {
        let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*.,])[a-zA-Z0-9!@#$%^&*.,]{8,10}$/;
        let password = null;
        while(!pattern.test(password)){
            password = new RandExp(pattern).gen()
        }
		await db.updateUser(query.username, {password: password})
        await sendResetEmail(user, password);
        sendData(res, "success");
	}
	catch (err) {
        sendError(res, err);
	}
});

export default router;