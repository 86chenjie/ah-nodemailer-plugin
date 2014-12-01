
/*
 *Send Mail Task
*__Author__: Panjie SW <panjie@panjiesw.com>*
*__Project__: ah-nodemailer-plugin*
*__Company__: PanjieSW*

Defines simple task to send email with nodemailer.
*********************************************
 */
exports.sendMail = {
  name: 'sendMail',
  description: "Send welcome email to newly signed up user with further instruction to activate their account",
  queue: 'default',
  plugins: [],
  pluginOptions: [],
  frequency: 0,

  /*
  Run sendMail task.
   */
  run: function(api, params, next) {
    return api.Mailer.send(params).then(function(response) {
      api.log("Mail sent to " + params.mail.to);
      return next(null, response);
    })["catch"](function(err) {
      api.log("Error sending mail", 'crit', err.message);
      api.log(err.stack, 'error');
      return next(err, null);
    });
  }
};
