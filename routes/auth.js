const express = require('express');
const router = express.Router();

const Student = require('../models').Student;
const passport = require('passport');
const LocalStrategy = require('passport-local') // maybe .Strategy

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user,done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Student.findById(id)
  .then (user => done (null, user))
  .catch(error => console.log(error));
});

passport.use(new LocalStrategy((username, password, done) => {
  Student.findOne({ where: { username } })
  .then(student => {
    if (!student) {
      done(null, false);
    }
    else if (student.password === password) done(null, student);
    else done(null, false);
  })
  .catch(error => {
    done(error)
  });
}));

router.get('/register', (req, res) => {
  res.render('register')
});

router.post('/register', (req, res) => {
  if (req.body.username === "" && req.body.password === ""){
    res.render('register', { error: 'Must enter a username and password' })
  } else if (req.body.password === "") {
    res.render('register', { usernameValue: req.body.username, error: 'Must enter a password' })
  } else if (req.body.username === ""){
    res.render('register', { error: 'Must enter a username' })
  } else {
    Student.findOne({ where: { username: req.body.username }})
    .then(student => {
      if (student){
        res.render('register', { error: 'Username already taken' })
      } else if (!student){
        Student.create(req.body)
        .then(response => {
          res.render('login')
        })
        .catch(error => {
          console.log('Error registering: ', error)
        })
      }
    })
    .catch(error => {
      console.log('Error searching for username', error)
    })
  }
});


  router.get('/login', (req,res) => {
    res.render('login')
  })

  // router.post('/login', (req, res, next) => {
  //   passport.authenticate('local', function(err, user) {
  //     if (err) { return next(err); }
  //     // Redirect if it fails
  //     if (!user) { return res.render('login', {error: "No such username/password combination. Try again."}); }
  //     res.render('studentHome')
  //   })(req,res,next);
  // });

  router.post('/login', passport.authenticate('local',{
    successRedirect: '/studentHome',
    failureRedirect: '/login'
  }));

  module.exports = router;
