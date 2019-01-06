var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '1234'));
var session = driver.session();

app.get('/', function(req, res) {
  session
    .run('MATCH(n) RETURN n LIMIT 25')
    .then(function(result) {
      console.log(result)
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.post('/path/add', function(req, res) {
  console.log("---------> path: ", req.body.session)
  var name = req.body.path_name;


  session.run('CREATE(n:OBJECT {elementPath:{elementPathParam}, session:{sessionParam}, elementPos:{elementPosParam}}) RETURN n.path', {
      elementPathParam: name,
      sessionParam: req.body.session,
      elementPosParam: req.body.elementPos
    })
    .then(function(result) {
      console.log("sucess!")
      res.redirect('/');

      session.close();
    })
    .catch(function(err) {
      console.log("error!")
      console.log("error!", err)
    })

});

app.post('/relationship/add', function(req, res) {
  console.log("---------> path: ", req.body.session)
  var name = req.body.path_name;

  session.run('MATCH (a:OBJECT) WHERE a.session = {sessionParam} AND a.elementPos = {elementPosAParam} CREATE(n:OBJECT {elementPath: {elementPathParam}, session: {sessionParam}, elementPos: {elementPosBParam}})-[:Follows]->(a) RETURN n', {
      elementPathParam: name,
      sessionParam: req.body.session,
      elementPosAParam: req.body.elementPos - 1,
      elementPosBParam: req.body.elementPos
    })
    .then(function(result) {
      console.log("sucess!")
      res.redirect('/');

      session.close();
    })
    .catch(function(err) {
      console.log("error!")
      console.log("error!", err)
    })

});




app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;