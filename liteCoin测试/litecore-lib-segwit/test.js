let litecore = require("./index.js");

var privateKey = new litecore.PrivateKey();

var address = privateKey.toAddress();
console.log(address);
// var address = new litecore.PrivateKey(wif).toAddress();