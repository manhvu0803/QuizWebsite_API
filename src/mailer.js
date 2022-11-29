const nodemailer = require("nodemailer");
require("dotenv/config");

exports.sendConfirmationEmail = function({toUser, hash}) {
    return new Promise((res, rej) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GoogleUser,
                pass: process.env.GooglePassword
            }
        })

        const message = {
            from: process.env.GoogleUser,
            to: toUser.email,
            subject: "Let's play - Activate Account",
            html: `
                <h3> Hello ${toUser.username}</h3>
                <p> Thanks for your regitering into our application. Just one more step ... </p>
                <p> To activate your account, please follow this link: <a target="_" href="https://lets-play.vercel.app/activate_account/${toUser.email}">Activate link</a> </p>
                <p>Let's play</p>
            `
        }

        transporter.sendMail(message, function(err, info){

            console.log(process.env.GooglePassword);
            if(err){
                rej(err)
            }
            else{
                res(info);
            }
        })
    })
}