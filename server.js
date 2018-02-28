const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session')
const { Quiz, Question, Student, Answer, QuizResponse, Sequelize } = require('./models');
const sequelize = new Sequelize(process.env.DATABASE_URL)

const hbs = require('express-handlebars');
app.engine('.handlebars', hbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ secret: process.env.SESSION_PASS}));

// routes
app.get('/', function(req,res){
  res.render('ana')
})

app.get('/admin', function(req,res){
  res.render('admin')
})

app.get('/newQuiz', function(req,res){
  res.render('newQuiz')
})

app.get('/hello', function(req,res){
  res.render('hello')
})

// at end, listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'));
