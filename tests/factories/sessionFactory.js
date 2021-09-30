const Buffer = require("safe-buffer").Buffer;
const KeyGrip = require("keygrip");
const keys = require("../../config/keys");
const keygrip = new KeyGrip([keys.cookieKey]);
module.exports = (user) => {
  // create same object as it is in session
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  // create session and session sig because it will be required by our servers
  // so that we can try to fake a session
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");
  const keygrip = new KeyGrip([keys.cookieKey]);
  // generation session signature for our server and setting it on browser cookie which will
  // be sent along every request to our servers
  const sig = keygrip.sign(`session=${session}`); // this will create session.sig for us
  // through which our server will know that we are valid user
  return { sig, session };
};
