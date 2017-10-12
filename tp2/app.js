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


('/api/messages', connector.listen()); 

var bot = new builder.UniversalBot(connector, [
    function(session){
        session.beginDialog('greetings');
    }
]);

var Menu = {
    "Demander mon nom": {
        item: "askName"
    },
    "Reserver":{
        item: "reservation"
    },
}

bot.dialog('greetings', [
    function(session){
        builder.Prompts.choice(session, "Bienvenue, vous souhaitez ? ", Menu);
    },
    function (session, results) {
        if(results.response){
            session.beginDialog(Menu[results.response.entity].item);
        }
    }
])
.triggerAction({
    matches: /^main menu$/i,
    confirmPrompt: 'Retourner au menu ?'
});

bot.dialog('askName', [
    function(session){
        builder.Prompts.text(session, 'Quel est votre prénom ?');
    },
    function(session, results){
        session.endDialog('Bonjour %s!', results.response);
    },
]).cancelAction(
    "cancelname", "Tapez main menu pour continuer.",
    {
        matches: /^cancel$/i,
        confirmPrompt: 'Retourner au menu ?'
    }
);

bot.dialog('reservation', [
    function (session) {
        session.beginDialog('telMe');
    },
    function (session, results) {
        session.send(`Voici votre reservation : <br/>
        Date de reservation : ${results.date}<br/>
        Nombre de personne : ${results.nbPeople}<br/>
        Au nom de : ${results.resaName}<br/>
        Telephone : ${results.resaTel}`);
    }
])
.cancelAction(
    "cancelreservation", "Tapez main menu pour continuer.",
    {
        matches: /^cancel$/i,
        confirmPrompt: 'Stopper tout ?'
    }
)
.reloadAction(
    "reloadreservation", "",
    {
        matches: /^reload$/i,
    }
)

bot.dialog('telMe', [
    function (session) {
        builder.Prompts.text(session, 'Pour quelle date souhaitez vous une reservation ?');
    },
    function (session, results) {
        session.dialogData.date = results.response;
        builder.Prompts.number(session, 'Pour combien de personne ?');
    },
    function (session, results) {
        session.dialogData.nbPeople = results.response;
        builder.Prompts.text(session, 'A quel nom ?');
    },
    function (session, results) {
        session.dialogData.resaName = results.response;
        // builder.Prompts.number(session, 'Quel est votre numero de telephone ?');
        session.beginDialog('phonePrompt');
    },
    function (session, results) {
        session.dialogData.resaTel = results.response;
        var finalResults = {
            date: session.dialogData.date,
            nbPeople: session.dialogData.nbPeople,
            resaName: session.dialogData.resaName,
            resaTel: session.dialogData.resaTel
        }
        session.endDialogWithResult(finalResults);
    }
]);

//Dialogue du teléphone 
bot.dialog('phonePrompt', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Veuillez utiliser un bon format de numero.")
        } else {
            builder.Prompts.text(session, "Quel est le numero de tel ?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        if (number.length == 10 || number.length == 11) {
            session.userData.phoneNumber = number;
            session.endDialogWithResult({ response: number });
        } else {
            // Repetition du dialogue
            session.replaceDialog('phonePrompt', { reprompt: true });
        }
    }
]);


/* 
State userData pour stocker le nom du user

Hello 
Bienvenue dans le Bot Résa
AskName

3 prompts
    Quelle date
    Combien de personnes
    A quel nom

Récapitulatif résa
    Date
    Nb personne
    Le nom de reservation

*/

/* 
    Menu des deux dialogues 
*/