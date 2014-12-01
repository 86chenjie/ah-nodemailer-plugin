
/*
 *Mailer Initializer
*__Author__: Panjie SW <panjie@panjiesw.com>*
*__Project__: ah-nodemailer-plugin*
*__Company__: PanjieSW*

Defines ``api.Mail``
*********************************************
 */
var ConsoleTransport, Mailer, Q, emailTemplates, nodemailer;

nodemailer = require('nodemailer');

emailTemplates = require('email-templates');

Q = require('q');

ConsoleTransport = function(options) {
  this.options = options;
};

ConsoleTransport.prototype.sendMail = function(emailMessage, callback) {
  console.log("Envelope: ", emailMessage.getEnvelope());
  emailMessage.pipe(process.stdout);
  emailMessage.on("error", function(err) {
    callback(err);
  });
  emailMessage.on("end", function() {
    callback(null, {
      messageId: emailMessage._messageId
    });
  });
  emailMessage.streamMessage();
};

Mailer = function(api, next) {

  /*
  The api is made available in ``api.Mailer`` object.
   */
  api.Mailer = {
    _start: function(api, callback) {
      var config;
      config = api.config.mailer;
      if (config.transport === 'stdout') {
        api.log("Creating stdout mail transport");
        api.Mailer.transport = nodemailer.createTransport(ConsoleTransport, {
          name: 'console.local'
        });
      } else {
        api.log("Creating " + config.transport + " mail transport");
        api.Mailer.transport = nodemailer.createTransport(config.transport, config.options);
      }
      api.log("Mailer transport created, available as ``api.Mailer.transport``");
      return callback();
    },

    /*
    Sends email with defined Mailer transport.
     */
    send: function(options, callback) {
      var config;
      config = api.config.mailer;
      if (!(options.mail && options.template && options.locals)) {
        throw new Error("Invalid options. Must contain template, mail, and locals property");
      }
      if (!options.mail.from) {
        options.mail.from = config.mailOptions.from;
      }
      return Q.nfcall(emailTemplates, config.templates).then(function(template) {
        return Q.nfcall(template, options.template, options.locals);
      }).then(function(resolved) {
        options.mail.html = resolved[0];
        options.mail.text = resolved[1];
        return Q.nfcall(api.Mailer.transport.sendMail, options.mail);
      }).nodeify(callback);
    }
  };
  return next();
};

exports.mailer = Mailer;
