const nodemailer = require("nodemailer");
require("dotenv/config");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GoogleUser,
        pass: process.env.GooglePassword
    }
})

exports.sendConfirmationEmail = function({toUser, hash}) {
    return new Promise((res, rej) => {

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Activate Account",
            html: `
                <h3> Hello ${toUser.username}</h3>
                <p> Thanks for your regitering into our application. Just one more step ... </p>
                <p> To activate your account, please follow this link: <a target="_" href="http://localhost:3000/activate_account/${toUser.username}">Activate link</a> </p>
                <p>Let's play</p>
            `
        }

        transporter.sendMail(message, function(err, info){

            if(err){
                rej(err)
            }
            else{
                res(info);
            }
        })
    })
}

exports.sendInviteEmail = function({toUser, inviter, groupname, inviteId}) {
    return new Promise((res, rej) => {

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Invitation",
            html: `
                <h3> Hello ${toUser.username}</h3>
                <p> ${inviter} invite you to join group: ${groupname} </p>
                <p> To join, please follow this link: <a target="_" href="http://localhost:3000/invite/${inviteId}">${groupname}</a> </p>
                <p>Let's play</p>
            `
        }

        transporter.sendMail(message, function(err, info){

            if(err){
                rej(err)
            }
            else{
                res(info);
            }
        })
    })
}