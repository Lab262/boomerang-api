
var SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');
var MailTemplateAdapter = require('parse-server-mail-template-adapter');
var emailAdapter = MailTemplateAdapter({
    adapter: SimpleSendGridAdapter({
      apiKey: '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',
      fromAddress: 'thiago@lab262.com',
    }),
    template: {
      verification: {
        subject: "Seu acesso ao Boomerang",
        // Choose one in body and bodyFile, if both setted then body used
        body: "verfication body",
        bodyFile: "./mail/VerificationEmailBody.txt"
      },
      resetPassword: {  // Same as verification
        subject: "reset password subject",
        // body: "<br> <br> <br> reset password body",
        bodyFile: "./mail/ResetPasswordEmail.txt"
      }
    }
  })

  module.exports = emailAdapter