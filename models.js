const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

// Connect to SQL database
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully')
  })
  .catch((err) => {
    console.log('Unable to connect to database. The error is: ', err)
  })

  // define models
const Quiz = sequelize.define('quiz', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  subject: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Question = sequelize.define('question', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionText: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  choiceA: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  choiceB: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  choiceC: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  choiceD: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  corrAns: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

// const Answer = sequelize.define('answer', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   answer: {
//     type: Sequelize.ENUM('A', 'B', 'C', 'D'),
//     allowNull: false
//   }
// });

const Student = sequelize.define('student', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const QuizResponse = sequelize.define('QuizResponse', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  response: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  correct: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {tableName: 'quiz_responses'});

Quiz.hasMany(Question, { onDelete: 'CASCADE' }) // Question now has QuizId
Quiz.hasMany(QuizResponse, { onDelete: 'CASCADE' }) // QuizResponse now has QuizId
Question.hasMany(QuizResponse, { onDelete: 'CASCADE' }) // QuizResponse now has QuestionId
// Answer.hasMany(QuizResponse, { onDelete: 'CASCADE' }) // QuizResponse now has AnswerId
Student.hasMany(QuizResponse, { onDelete: 'CASCADE' }) // QuizResponse now has StudentId

// Question now has QuizId foreign key
Quiz.hasMany(Question, { onDelete: 'CASCADE' })
Question.belongsTo(Quiz, { onDelete: 'CASCADE' })

// Question now has AnswerId foreign key
// Answer.hasMany(Question, { onDelete: 'CASCADE' })
// Question.belongsTo(Answer, { onDelete: 'CASCADE' })

// Make a student - quiz join table
Student.belongsToMany(Quiz, { through: 'student_quizzes' })
Quiz.belongsToMany(Student, { through: 'student_quizzes' })

module.exports = {
  sequelize,
  Sequelize,
  Quiz,
  Question,
  Student,
  // Answer,
  QuizResponse
};
