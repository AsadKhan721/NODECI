const { deleteCache } = require("../services/cache");
module.exports = async (req, rest, next) => {
  await next(); // first request handler will run
  deleteCache(req.user.id); // then i will run deleteCache in which user id will be passed
};
