const Pool = require('pg').Pool;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secretkey23456';

const pool = new Pool({
  user: 'stmdpszlfefgwh',
  host: 'ec2-52-5-176-53.compute-1.amazonaws.com',
  database: 'ddtbk6el1tmd16',
  password: 'f0120ea3bfd54157f168fec3beffcdd27730b7e2552253b3cf8765076cd4b6e6',
  port: 5432,
  ssl: true,
});

const getAllCategory = (request, response) => {
  pool.query(
    'SELECT category_id AS id, category_name AS name, category_desc AS desc, category_image AS image FROM category ORDER BY category_id',
    (error, results) => {
      console.log(error);
      console.log(results);
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      response.status(200).json(results.rows);
    },
  );
};

const getQuestionListByCategory = (request, response) => {
  const categoryId = request.body.categoryId;
  const userId = request.body.userId;
  var listData = [];
  var beginnerCount = 0;
  var intermediateCount = 0;
  var advancedCount = 0;
  var beginnerTotal = 0;
  var intermediateTotal = 0;
  var advancedTotal = 0;
  var i = 0,
    j = 0;

  pool.query(
    'SELECT q.question_id, q.category_id, q.level_id, l.level_name, q.passage_id, false AS completed ' +
    'FROM question q, level l ' +
    'WHERE q.category_id = $1 AND q.level_id = l.level_id ' +
    'ORDER BY q.level_id, q.question_id',
    [categoryId],
    (error, results1) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }

      listData = results1.rows;

      pool.query(
        'SELECT question_id AS id, completed FROM question_progress WHERE user_id = $1 ORDER BY question_id',
        [userId],
        (error, results2) => {
          if (error) {
            response.status(200).json({ code: 201, message: 'Server Error!' });
            return;
          }

          for (i = 0; i < listData.length; i++) {
            for (j = 0; j < results2.rows.length; j++) {
              if (listData[i].question_id === results2.rows[j].id) {
                listData[i].completed = results2.rows[j].completed;
              }
            }
            if (listData[i].completed === true) {
              if (listData[i].level_id === 1) {
                beginnerCount += 1;
                beginnerTotal += 1;
              } else if (listData[i].level_id === 2) {
                intermediateCount += 1;
                intermediateTotal += 1;
              } else if (listData[i].level_id === 3) {
                advancedCount += 1;
                advancedTotal += 1;
              }
            } else if (listData[i].completed === false) {
              if (listData[i].level_id === 1) {
                beginnerTotal += 1;
              } else if (listData[i].level_id === 2) {
                intermediateTotal += 1;
              } else if (listData[i].level_id === 3) {
                advancedTotal += 1;
              }
            }
          }

          response.status(200).json({
            question_list: listData,
            beginner_count: beginnerCount,
            intermediate_count: intermediateCount,
            advanced_count: advancedCount,
            beginner_total: beginnerTotal,
            intermediate_total: intermediateTotal,
            advanced_total: advancedTotal,
          });
        },
      );
    },
  );
};

const getQuestionDetail = (request, response) => {
  const userId = request.body.userId;
  const questionId = request.body.questionId;
  var questionDetail = [];

  pool.query(
    'SELECT q.question_id, q.multiple_choice, q.question_desc, q.answer, q.choice1, q.choice2, ' +
    'q.choice3, q.choice4, q.passage_id, q.category_id, q.level_id, r.passage_desc ' +
    'FROM question q, reading_passage r ' +
    'WHERE q.question_id = $1 AND q.passage_id = r.passage_id',
    [questionId],
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }

      questionDetail = results.rows[0];

      pool.query(
        'SELECT user_id, question_id, completed, answer FROM question_progress WHERE user_id = $1 AND question_id = $2',
        [userId, questionId],
        (error, results2) => {
          if (error) {
            response.status(200).json({ code: 201, message: 'Server Error!' });
            return;
          }

          if (results2.rows.length > 0) {
            response.status(200).json({
              question_detail: questionDetail,
              question_status: results2.rows[0],
            });
          } else {
            response.status(200).json({
              question_detail: questionDetail,
              question_status: {
                user_id: userId,
                question_id: questionId,
                completed: false,
                answer: '',
              },
            });
          }
        },
      );
    },
  );
};

const checkAnswer = (request, response) => {
  const userId = request.body.userId;
  const questionId = request.body.questionId;
  const userAnswer = request.body.answer;
  const levelId = request.body.levelId;
  var plusScore = 0;
  var plusPoint = 0;

  pool.query(
    'SELECT * FROM question WHERE question_id = $1 AND LOWER(answer) = LOWER($2)',
    [questionId, userAnswer],
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      if (results.rows.length > 0) {
        pool.query(
          'SELECT * FROM question_progress WHERE user_id = $1 AND question_id = $2',
          [userId, questionId],
          (error, results2) => {
            if (error) {
              response.status(200).json({ code: 201, message: 'Server Error!' });
              return;
            }

            if (results2.rows.length > 0) {
              pool.query(
                'UPDATE question_progress SET completed = true, answer = LOWER($1) ' +
                'WHERE user_id = $2 AND question_id = $3',
                [userAnswer, userId, questionId],
                (error, results) => {
                  if (error) {
                    response
                      .status(200)
                      .json({ code: 201, message: 'Server Error!' });
                    return;
                  }

                  pool.query(
                    'SELECT point, score FROM level WHERE level_id = $1',
                    [levelId],
                    (error, results) => {
                      if (error) {
                        response
                          .status(200)
                          .json({ code: 201, message: 'Server Error!' });
                        return;
                      }

                      plusPoint = results.rows[0].point;
                      plusScore = results.rows[0].score;

                      pool.query(
                        'UPDATE users SET point = point + $1, score = score + $2 WHERE user_id = $3',
                        [plusPoint, plusScore, userId],
                        (error, results) => {
                          if (error) {
                            response
                              .status(200)
                              .json({ code: 201, message: 'Server Error!' });
                            return;
                          }

                          response.status(200).json({
                            completed: true,
                            score_plus: plusScore,
                            point_plus: plusPoint,
                          });
                          return;
                        },
                      );
                    },
                  );
                },
              );
            } else {
              pool.query(
                'INSERT INTO question_progress VALUES ($1,$2,true,$3)',
                [userId, questionId, userAnswer],
                (error, results) => {
                  if (error) {
                    response
                      .status(200)
                      .json({ code: 201, message: 'Server Error!' });
                    return;
                  }

                  pool.query(
                    'SELECT point, score FROM level WHERE level_id = $1',
                    [levelId],
                    (error, results) => {
                      if (error) {
                        response
                          .status(200)
                          .json({ code: 201, message: 'Server Error!' });
                        return;
                      }

                      plusPoint = results.rows[0].point;
                      plusScore = results.rows[0].score;

                      pool.query(
                        'UPDATE users SET point = point + $1, score = score + $2 WHERE user_id = $3',
                        [plusPoint, plusScore, userId],
                        (error, results) => {
                          if (error) {
                            response
                              .status(200)
                              .json({ code: 201, message: 'Server Error!' });
                            return;
                          }

                          response.status(200).json({
                            completed: true,
                            score_plus: plusScore,
                            point_plus: plusPoint,
                          });
                          return;
                        },
                      );
                    },
                  );
                },
              );
            }
          },
        );
      } else {
        pool.query(
          'SELECT * FROM question_progress WHERE user_id = $1 AND question_id = $2',
          [userId, questionId],
          (error, results2) => {
            if (error) {
              response.status(200).json({ code: 201, message: 'Server Error!' });
              return;
            }

            if (results2.rows.length > 0) {
              pool.query(
                'UPDATE question_progress SET answer = LOWER($1) ' +
                'WHERE user_id = $2 AND question_id = $3',
                [userAnswer, userId, questionId],
                (error, results) => {
                  if (error) {
                    response
                      .status(200)
                      .json({ code: 201, message: 'Server Error!' });
                    return;
                  }

                  response.status(200).json({
                    completed: false,
                    score_plus: plusScore,
                    point_plus: plusPoint,
                  });
                  return;
                },
              );
            } else {
              pool.query(
                'INSERT INTO question_progress VALUES ($1,$2,false,$3)',
                [userId, questionId, userAnswer],
                (error, results) => {
                  if (error) {
                    response
                      .status(200)
                      .json({ code: 201, message: 'Server Error!' });
                    return;
                  }

                  response.status(200).json({
                    completed: false,
                    score_plus: plusScore,
                    point_plus: plusPoint,
                  });
                  return;
                },
              );
            }
          },
        );
      }
    },
  );
};

const getLeaderboard = (request, response) => {
  pool.query(
    'SELECT user_id, username, score, avatar, golden_username FROM users ORDER BY score DESC, username ASC',
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      response.status(200).json(results.rows);
    },
  );
};

const insertAchievement = (request, response) => {
  const name = request.body.name;
  const desc = request.body.desc;
  const image = request.body.image;
  pool.query(
    'insert into achievement(achievement_name,achievement_desc,achievement_image) values($1,$2,$3)',
    [name, desc, image],
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      response.status(200).json({ success: true });
    },
  );
};

const insertShop = (request, response) => {
  const name = request.body.name;
  const price = request.body.price;
  const image = request.body.image;
  pool.query(
    'insert into shop(name,price,image) values($1,$2,$3)',
    [name, price, image],
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      response.status(200).json({ success: true });
    },
  );
};

const insertCategory = (request, response) => {
  const name = request.body.name;
  const desc = request.body.desc;
  const image = request.body.image;
  pool.query(
    'insert into category(category_name,category_desc,category_image) values($1,$2,$3)',
    [name, desc, image],
    (error, results) => {
      if (error) {
        response.status(200).json({ code: 201, message: 'Server Error!' });
        return;
      }
      response.status(200).json({ success: true });
    },
  );
};

module.exports = {
  getAllCategory,
  getQuestionListByCategory,
  getQuestionDetail,
  checkAnswer,
  getLeaderboard,
  insertAchievement,
  insertShop,
  insertCategory,
};
