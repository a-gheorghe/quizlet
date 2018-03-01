const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session')
const { Quiz, Question, Student, Answer, QuizResponse, Sequelize } = require('./models');
const sequelize = new Sequelize(process.env.DATABASE_URL)
const auth = require('./routes/auth');
const routes = require('./routes/routes')

const hbs = require('express-handlebars');
app.engine('.handlebars', hbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ secret: process.env.SESSION_PASS}));


app.use('/', auth)
app.use('/', routes)
// generic error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err)
});

// at end, listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'));
