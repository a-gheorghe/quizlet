const express = require('express');
const router = express.Router();
const { Quiz, Question, Student, Answer, QuizResponse, Sequelize } = require('../models');

// Public Routes

router.get('/', (req,res) => {
  res.render('home')
})

router.get('/admin', (req,res) => {
  res.render('admin')
})

router.get('/newQuiz', (req,res) => {
  Quiz.findAll()
  .then(response => {
    res.render('newQuiz', {allQuizzes: response})
  })
});

router.post('/newQuiz', (req, res) => {
  Quiz.create({name: req.body.name, subject: req.body.subject, status: 'Incomplete'})
  .then(quiz => {
    req.session.quizId = quiz.dataValues.id
    res.redirect('/newQuestion')
  })
  .catch(error => {
    console.log('Error creating quiz: ', error)
  })
});

router.get('/newQuestion', (req,res) => {
  res.render('newQuestion', { quizId: req.session.quizId })
})

router.post('/add-question', (req,res) => {
  if (req.body.question === "" || req.body.choiceA === "" || req.body.corrAns === undefined){
    res.render('newQuestion', {
      question: req.body.question,
      choiceA: req.body.choiceA,
      choiceB: req.body.choiceB,
      choiceC: req.body.choiceC,
      choiceD: req.body.choiceD,
      corrAns: req.body.corrAns,
      error: 'Check empty fields'
     })
  } else {
    Question.create({
      quizId: req.session.quizId,
      questionText: req.body.question,
      choiceA: req.body.choiceA,
      choiceB: req.body.choiceB,
      choiceC: req.body.choiceC,
      choiceD: req.body.choiceD,
      corrAns: req.body.corrAns
    })
    .then(response => {
      res.render('newQuestion', { quizId: req.session.quizId })
    })
    .catch(error => {
      console.log('Error creating question', error)
    })
  }
});

router.get('/editQuiz/:id', (req, res) => {
  res.render('editQuiz')
})

// Middleware to check if logged in

router.use((req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

// Private routes accessible only if logged in

module.exports = router;
