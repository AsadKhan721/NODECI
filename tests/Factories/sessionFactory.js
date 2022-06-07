// Buffer library will help us to generate session which is a base64 that contains data like userid
// and we set session and session.sig in our cookie so that we can avoid authentication
const Buffer = require("safe-buffer").Buffer;
// KeyGrip will be used to generate session.sig
// which is a combination of secretKey and session that will verify that our session has not been tampered
const KeyGrip = require("keygrip");
const keys = require("../../config/keys");

module.exports = (user = { id: "" }) => {
  const keyGrip = new KeyGrip([keys.cookieKey]);
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  console.log(sessionObject);
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");
  const sig = keyGrip.sign(`session=${session}`);
  return { session, sig };
};
