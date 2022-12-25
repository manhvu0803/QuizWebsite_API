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
        let username;
        if(toUser.username.match('/^[0-9]+$/') === null && toUser.displayName != null){
            username = toUser.displayName
        }
        else{
            username = toUser.username
        }

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Activate Account",
            html: `
                <h3> Hello ${username}</h3>
                <p> Thanks for your regitering into our application. Just one more step ... </p>
                <p> To activate your account, please follow this link: <a target="_" href="${process.env.host}/activate_account/${toUser.username}">Activate link</a> </p>
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

        let username;
        if(toUser.username.match('/^[0-9]+$/') === null && toUser.displayName != null){
            username = toUser.displayName
        }
        else{
            username = toUser.username
        }

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Invitation",
            html: `
                <h3> Hello ${username}</h3>
                <p> ${inviter} invite you to join group: ${groupname} </p>
                <p> To join, please follow this link: <a target="_" href="${process.env.host}/group/invite/${inviteId}">${groupname}</a> </p>
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

exports.sendResetEmail = function(toUser, newPass) {
    return new Promise((res, rej) => {

        let username;
        if(toUser.username.match('/^[0-9]+$/') === null && toUser.displayName != null){
            username = toUser.displayName
        }
        else{
            username = toUser.username
        }

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Reset Email",
            html: `
                <h3> Hello, ${username}</h3>
                <p> Your new password: <b>${newPass}</b> </p>
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

exports.sendCollabEmail = function ({toUser, inviter, presentname, inviteId}){
    return new Promise((res, rej) => {

        let username;
        if(toUser.username.match('/^[0-9]+$/') === null && toUser.displayName != null){
            username = toUser.displayName
        }
        else{
            username = toUser.username
        }

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Invitation",
            html: `
                <h3> Hello ${username}</h3>
                <p> ${inviter.displayName} want you collab in presentation ${presentname} </p>
                <p> To join, please follow this link: <a target="_" href="${process.env.host}/present/invite/${inviteId}">${presentname}</a> </p>
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
