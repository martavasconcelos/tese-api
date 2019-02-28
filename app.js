let express = require('express');
let path = require('path');
let logger = require('morgan');
let bodyParser = require('body-parser');
let neo4j = require('neo4j-driver').v1;

let app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var driver = neo4j.driver('bolt://10.227.107.156', neo4j.auth.basic('neo4j', 'tese2018'));
var session = driver.session();

app.get('/', function (req, res) {
    session
        .run('MATCH(n) RETURN n LIMIT 25')
        .then(function (result) {
            console.log(result)
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/lastId', function (req, res) {
    session
        .run('MATCH (n:OBJECT) RETURN n.pathId AS count ORDER BY count desc')
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.post('/pathId', function (req, res) {
    session
        .run('Match (n:OBJECT {path:{pathParam}}) RETURN n.pathId', {
            pathParam: req.body.path
        })
        .then(function(result) {
            console.log(result);
            res.json(result);
        })
        .catch(function (err) {
            console.log(err);
        })
});

app.post('/node/add', function (req, res) {
    session.run('CREATE(n:OBJECT {path:{pathParam}, pathId:{pathParamId}, session:{sessionParam}, elementPos:{elementPosParam}, action: {actionParam}, actionId: {actionParamId}, url: {urlParam}, value:{valueParam}}) RETURN n', {
        pathParam: req.body.path,
        pathParamId: req.body.pathId,
        sessionParam: req.body.session,
        elementPosParam: parseInt(req.body.elementPos),
        actionParam: req.body.action,
        actionParamId: req.body.actionId,
        urlParam: req.body.url,
        valueParam: req.body.value
    })
        .then(function (result) {
            console.log("sucess!")

            session.close();
        })
        .catch(function (err) {
            console.log("error!", err)
        })

});

app.post('/relationship/add', function (req, res) {
    session.run('MATCH (a:OBJECT) WHERE a.session = {sessionParam} AND a.elementPos = {elementPosAParam} CREATE(n:OBJECT {path: {pathParam}, pathId: {pathParamId}, session: {sessionParam}, elementPos: {elementPosBParam}, action: {actionParam}, actionId: {actionParamId}, url: {urlParam}, value: {valueParam}})-[:Follows]->(a) RETURN n', {
        pathParam: req.body.path,
        pathParamId: req.body.pathId,
        sessionParam: req.body.session,
        elementPosAParam: parseInt(req.body.elementPos) - 1,
        elementPosBParam: parseInt(req.body.elementPos),
        actionParam: req.body.action,
        actionParamId: req.body.actionId,
        urlParam: req.body.url,
        valueParam: req.body.value
    })
        .then(function (result) {
            console.log("sucess!")
            session.close();
        })
        .catch(function (err) {
            console.log("error!", err)
        })

});




app.listen(8080, '10.227.107.156');
console.log('Server Started on Port 8080');

module.exports = app;