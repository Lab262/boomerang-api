// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');
var EmailAdapter = require(path.join(__dirname, '/email/email-adapter'));
var EmailCustomPages = require(path.join(__dirname, '/email/email-custom-pages'));
var PushNotificationsAdapter = require(path.join(__dirname, '/push-notifications/push-notifications-adapter'));
var FileStorageAdapter = require(path.join(__dirname, '/file-storage/file-storage-adapter'));

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
// console.log(FileStorageAdapter);
var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_qp6npbjk:cce6ao8d9di6on7j9sqcjgeh3u@ds157539.mlab.com:57539/heroku_qp6npbjk',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  appName: "Boomerang",
  publicServerURL: "http://localhost:1337/parse",
  emailAdapter: EmailAdapter,
  customPages:EmailCustomPages,
  push: PushNotificationsAdapter,
  filesAdapter: FileStorageAdapter,
  liveQuery: {
    classNames: ['Comment', 'Post', 'Like', 'Recommended', 'Chat', 'Message', 'Profile', 'Scheme', 'Interested', 'Notification', 'Follow']
  },
  allowClientClassCreation: true
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
