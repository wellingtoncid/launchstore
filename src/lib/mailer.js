const mailer = require('nodemailer')


module.exports = mailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b00f041a133908",
    pass: "15de292d1ae42b"
  }
});