var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
   console.log(`server name:${server.name} | server url: ${server.url}`);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, [
    function (session){
        session.beginDialog('greetings');
    }
]);

bot.dialog('greetings',[
    function(session){
        session.beginDialog('askName');
    },
    function(session, results){
        session.endDialog('Hello %s!', results.response);
    }
]);

bot.dialog('askName',[
 function(session){
     builder.Prompts.text(session, 'Hi! What is your name ?');
 },
 function(session, results){
     session.endDialogWithResult(results);
 }
]);
