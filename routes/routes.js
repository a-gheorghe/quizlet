const express = require('express');
const router = express.Router();
const { Quiz, Question, Student, Answer, QuizResponse, Sequelize } = require('../models');

// Public Routes

router.get('/', (req,res) => {
  res.render('home', {css:['home.css']})
})

router.get('/newQuiz', (req,res) => {
  Quiz.findAll()
  .then(response => {
    res.render('newQuiz', {allQuizzes: response})
  })
});

router.post('/newQuiz', (req, res) => {
  Quiz.create({
    name: req.body.name, subject: req.body.subject, status: 'Incomplete'})
  .then(quiz => {
    req.session.quizId = quiz.dataValues.id
    res.redirect('/newQuestion')
  })
  .catch(error => {
    console.log('Error creating quiz: ', error)
  })
});

router.get('/newQuestion', (req,res) => {
  console.log('req.session is: ', req.session)
  res.render('newQuestion', { quizId: req.session.quizId })
})

router.post('/addQuestion', (req,res) => {
  console.log('req.session inside add question', req.session)
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
    Question.count({ where: { id: req.session.questionId }})
    .then(count => {
      if (count !== 0){
        // update
        Question.update({
          quizId: req.session.quizId,
          questionText: req.body.question,
          choiceA: req.body.choiceA,
          choiceB: req.body.choiceB,
          choiceC: req.body.choiceC,
          choiceD: req.body.choiceD,
          corrAns: req.body.corrAns
        }, { where: { id: req.session.questionId }
        })
        .then(question => {
          res.redirect('/editQuiz/' + req.session.quizId)
        })
        .catch(error => {
          console.log(error)
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
    })
  }
});





router.get('/editQuiz/:id', (req, res) => {
  req.session.quizId = req.params.id
  console.log('req.session inside editQuiz is: ', req.session)
  Question.findAll({ where: { quizId: req.params.id  }})
  .then(questions => {
    res.render('editQuiz', { questions: questions, session: req.session })
  })
  .catch(err => {
    console.log('error getting to editQuiz/quizId', err)
  })
})

router.get('/editQuiz/:quizId/Question/:id', (req,res) => {
  req.session.questionId = req.params.id
  console.log('req.session inside the specific question', req.session)
  Question.find({
    where: { id: req.params.id }
  })
  .then((question) => {
    console.log('question.dataValues', question.dataValues)
    res.render('newQuestion', {
      questionId: req.params.id,
      quizId: req.params.quizId,
      question: question.dataValues.questionText,
      choiceA: question.dataValues.choiceA,
      choiceB: question.dataValues.choiceB,
      choiceC: question.dataValues.choiceC,
      choiceD: question.dataValues.choiceD,
      corrAns: question.dataValues.corrAns,
      isASelected: question.dataValues.corrAns === 'A',
      isBSelected: question.dataValues.corrAns === 'B',
      helpers: {
        // isCSelected() {
        //   return question.dataValues.corrAns === 'C';
        // },
        isSelected(letter){
          if (question.dataValues.corrAns === letter){
            return 'selected';
          } else {
            return '';
          }
        }
      }
    })
  })
  .catch(err => {
    console.log('error error error', err)
  })
})

router.post('/completeQuiz', (req,res) => {
  Quiz.update({status: 'Complete'}, { where: { id: req.session.quizId }})
  .then(question => {
    res.redirect('/newQuiz')
  })
  .catch(error => {
    console.log(error)
  })
})

// Middleware to check if logged in

router.use((req, res, next) => {
  console.log('in middleware', req.user)
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

// Private routes accessible only if logged in

router.get('/studentHome', (req,res) => {
  Quiz.findAll({ where: { status: 'Complete'  }})
  .then(quizzes => {
    console.log('questions')
    res.render('studentHome', { quizzes: quizzes, student: req.user })
  })
  .catch(err => {
    console.log('error getting to editQuiz/quizId', err)
  })
})

router.get('/takeQuiz/:id', (req, res) => {
  req.session.quizId = req.params.id
  console.log('req.session inside editQuiz is: ', req.session)
  Question.findAll({ where: { quizId: req.params.id  }})
  .then(questions => {
    QuizResponse.findAll({ where: {
      quizId: req.params.id,
      studentId: req.user.id
    }})
    .then(quizResponses => {
      quizResponses.forEach(response => {
        for (var el in questions) {
          if (questions[el].id == response.questionId) {
            questions[el].checked = true;
            if (response.correct === true){
              questions[el].correct = true
            } else {
              questions[el].correct = false
            }
          }
        }
      })
      console.log(questions);
      res.render('takeQuiz', { questions: questions, session: req.session, student: req.user, responses: quizResponses })
    })
  })
  .catch(err => {
    console.log('error getting to editQuiz/quizId', err)
  })
})

router.get('/takeQuiz/:quizId/Question/:id', (req,res) => {
  req.session.questionId = req.params.id
  console.log('req.session inside the specific question', req.session)
  Question.find({
    where: { id: req.params.id }
  })
  .then((question) => {
    console.log('question.dataValues', question.dataValues)
    res.render('takeQuestion', {
      questionId: req.params.id,
      quizId: req.params.quizId,
      question: question.dataValues.questionText,
      choiceA: question.dataValues.choiceA,
      choiceB: question.dataValues.choiceB,
      choiceC: question.dataValues.choiceC,
      choiceD: question.dataValues.choiceD,
    })
  })
  .catch(err => {
    console.log('error error error', err)
  })
})

router.post('/submitAnswer', (req,res) => {
  console.log('req.session inside submit answer', req.session)
  console.log('req body chosen ans', req.body.chosenAns)

  // check if this student already submitted an answer
  QuizResponse.count({where: {
    studentId: req.user.id,
    quizId: req.session.quizId,
    questionId: req.session.questionId
  }})
  .then(count => {
    if (count > 0){
      Question.findById(req.session.questionId)
      .then(question => {
        res.render('takeQuestion', {
          questionId: req.params.id,
          quizId: req.params.quizId,
          question: question.dataValues.questionText,
          choiceA: question.dataValues.choiceA,
          choiceB: question.dataValues.choiceB,
          choiceC: question.dataValues.choiceC,
          choiceD: question.dataValues.choiceD,
          error: 'Already submitted an answer'
        })
      })
      .catch(error => {
        console.log('error in count > 0 render', error)
      })
    } else {
      //find correct answer for the particular question, save it as a variable
      Question.findById(req.session.questionId)
      .then(question => {
        return question.dataValues.corrAns
      })
      .then(correctAnswer => {
        return req.body.chosenAns === correctAnswer
      })
      .then(isCorrect => {
        QuizResponse.create({
          response: req.body.chosenAns,
          correct: isCorrect,
          quizId: req.session.quizId,
          questionId: req.session.questionId,
          studentId: req.user.id
        })
      })
      .then(quizResponse => {
        const next = parseInt(req.session.questionId) + 1
        Question.count({where: {
          id: next,
          quizId: req.session.quizId
        }})
        .then(count => {
          if (count === 0){
            res.redirect('/takeQuiz/' + req.session.quizId)
          } else {
            res.redirect('/takeQuiz/' + req.session.quizId + '/Question/' + next)
          }
        })
      })
      .catch(error => {
        console.log('Error in else statement chain', error)
      })
    } // ends else
  }) // ends count .then
  .catch(error => {
    console.log('Error in count chain', error)
  })
}) // ends post request

router.get('/nextQuestion', (req,res) => {
  const next = parseInt(req.session.questionId) + 1
  Question.count({where: {
    id: next,
    quizId: req.session.quizId
  }})
  .then(count => {
    if (count === 0){
      res.redirect('/takeQuiz/' + req.session.quizId)
    } else {
      res.redirect('/takeQuiz/' + req.session.quizId + '/Question/' + next)
    }
  })
  .catch(error => {
    console.log('Error in else statement chain', error)
  })
})

router.get('/prevQuestion', (req,res) => {
  const prev = parseInt(req.session.questionId) + 1
  Question.count({where: {
    id: prev,
    quizId: req.session.quizId
  }})
  .then(count => {
    if (count === 0){
      res.redirect('/takeQuiz/' + req.session.quizId)
    } else {
      res.redirect('/takeQuiz/' + req.session.quizId + '/Question/' + prev)
    }
  })
  .catch(error => {
    console.log('Error in else statement chain', error)
  })
})



module.exports = router;
