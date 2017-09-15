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

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send(`it's work | [Message.length = ${session.message.text.length}]`);
    // session.send(` = ${session.dialogData}]`);
    // session.send(`it's work | [Message.length = ${strongify.}]`);
    bot.on('typing', function(){
        session.send('tu écris quoi la ? ^^');
    });

    bot.on('conversationUpdate', function (message) {
        if (message.membersAdded && message.membersAdded.length > 0) {
            var membersAdded = message.membersAdded
                .map(function (m) {
                    var isSelf = m.id === message.address.bot.id;
                    return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
                })
                .join(', ');
    
            if (membersAdded == 'User') {
                bot.send(new builder.Message()
                    .address(message.address)
                    .text('Bonjour')
                );
            }
        }
    });

    if (session.message.text === "doheavywork") {
        session.sendTyping();
        setTimeout(()  => {
            session.send("Désolé j'etais occupé :p");
        }, 5000);
    }
});


// Doheavywork doit ramer 3 sec avant de repondre 
