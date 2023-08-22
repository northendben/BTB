const sgMail = require('@sendgrid/mail')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

sgKey = process.env.sgKey

sgMail.setApiKey(sgKey)

async function sendEmail(emailData){
    const msg = {
        to: process.env.contactEmail,
        from: process.env.fromEmail,
        subject: emailData.subject,
        replyTo: emailData.userEmail,
        text: emailData.body
    }
    console.log(msg)
    try{
        await sgMail.send(msg)
        console.log('in the try')
        return {status: 200, message: 'Email Sent Successfully'}
    } catch (e){
        console.log(e)
        return {status: 500, message: 'An error occurred during sending.', error: e}
    }
}

module.exports = sendEmail