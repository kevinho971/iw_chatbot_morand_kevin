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
    },
]);
// Dialogue par défaut
bot.dialog('greetings',[
    function(session){
        session.beginDialog('askName');
    },
    function(session){
        session.beginDialog('resa');
    },
]);

// Dialogue de demande de nom
bot.dialog('askName',[
    function(session){
        builder.Prompts.text(session, 'Bienvenue Dans BotResa quel est ton prénom ?');
    },
    function(session, results){
        session.endDialog('Bonjour %s!', results.response);
    }
]);

//Dialogue de Résevation
bot.dialog('resa', [
    function (session) {
        session.beginDialog('stepResa');
    },
    function (session, results) {
        session.send(`Votre réservation : <br/>
        Date : ${results.Date} <br/>
        Nombre de personne : ${results.nbPeople} <br/>
        Nom de la réservation : ${results.resaName}`);
    }
]);


// Dialogue étape de résa
bot.dialog('stepResa', [
    function (session) {
        builder.Prompts.text(session, 'Pour quelle date souhaitez vous une reservation ?');
    },
    function (session, results) {
        // Svg de la date
        session.dialogData.Date = results.response;
        builder.Prompts.number(session, 'Pour combien de personne ?');
    },
    function (session, results) {
        // Svg de du nombre de personne
        session.dialogData.nbPeople = results.response;
        builder.Prompts.text(session, 'Quel est le nom de la personne qui réserve ?');
    },
    function (session, results) {
        // Svg du nom de reservation
        session.dialogData.resaName = results.response;
        var finalResults = {
            Date: session.dialogData.Date,
            nbPeople: session.dialogData.nbPeople,
            resaName: session.dialogData.resaName
        }
        session.endDialogWithResult(finalResults);
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