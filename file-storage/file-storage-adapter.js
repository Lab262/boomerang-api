var GCSAdapter = require('parse-server-gcs-adapter');

var bucketName = "";
console.log("Current version:" + process.env.NODE_ENV)
 if (process.env.NODE_ENV == "production") {     
    bucketName = "boomerang-production";
 } else if (process.env.NODE_ENV == "test") { 
    bucketName = "boomerang-test";
 } else { 
     bucketName = "boomerang-dev";
 }
 console.log("Bucket name " + bucketName);
 

var gcsAdapter = new GCSAdapter('999065181840', 
								'./file-storage/resources/Boomerang-ba226c3a289a.json', 
								bucketName , {
									bucketPrefix: '',
									directAccess: true
								});

  module.exports = gcsAdapter