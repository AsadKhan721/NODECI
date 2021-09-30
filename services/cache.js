const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");
const client = redis.createClient(keys.redis_url);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  // here this refers to query object that is returned by Model.find()
  this.useCache = true; // by using useCache i can check if i need to cache this data or not?
  this.hashKey = JSON.stringify(options.key || "");
  console.log("HAshKey", this.hashKey);
  return this; // returning this so that i can chain other functions like query.cache().limit().sort()
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const collection = this.mongooseCollection.name;
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), { collection })
  );
  const cachedValue = await client.hget(this.hashKey, key);
  if (cachedValue) {
    console.log("Cached version");
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }
  const result = await exec.apply(this, arguments); // will mongo instance with multiple values
  console.log("From Db");
  client.hset(this.hashKey, key, JSON.stringify(result)); // converting to json
  return result;
};

module.exports = {
  deleteCache: function (hashKey = "") {
    client.del(JSON.stringify(hashKey));
  },
};
