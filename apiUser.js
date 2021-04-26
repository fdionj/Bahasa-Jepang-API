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

const signUp = (request, response) => {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;

  var hash = crypto
    .createHash('md5')
    .update(password)
    .digest('hex');

  pool.query(
    'INSERT INTO users(username,email,password) VALUES($1,$2,$3)',
    [username, email, hash],
    (error, results) => {
      if (error) {
        response
          .status(200)
          .json({code: 201, message: 'Username or Email Already Registered!'});
        return;
      }
      response
        .status(200)
        .json({code: 200, message: 'Account Successfully Registered!'});
    },
  );
};

const signIn = (request, response) => {
  const email = request.body.email;
  const password = crypto
    .createHash('md5')
    .update(request.body.password)
    .digest('hex');

  pool.query(
    'SELECT COUNT(*) AS total, user_id AS id, username AS name FROM users WHERE (email = $1 OR username = $1) AND password = $2 GROUP BY user_id, username, email',
    [email, password],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server Error!'});
        return;
      }

      if (results.rows.length == 0) {
        response
          .status(200)
          .json({code: 201, message: 'Wrong Username/Email or Password!'});
        return;
      }

      const expiresIn = 24 * 60 * 60;
      const accessToken = jwt.sign(
        {
          id: results.rows,
        },
        SECRET_KEY,
        {
          expiresIn: expiresIn,
        },
      );
      return response.status(200).send({
        access_token: accessToken,
        user_id: results.rows[0].id,
        expires_in: expiresIn,
        message: 'Login Success!',
        code: 200,
      });
    },
  );
};

const getProfile = (request, response) => {
  const user_id = request.body.userId;
  var userData = [];
  var listData = [];
  var vocabularyBeginnerCount = 0;
  var vocabularyBeginnerTotal = 0;
  var vocabularyIntermediateCount = 0;
  var vocabularyIntermediateTotal = 0;
  var vocabularyAdvancedCount = 0;
  var vocabularyAdvancedTotal = 0;
  var grammarBeginnerCount = 0;
  var grammarBeginnerTotal = 0;
  var grammarIntermediateCount = 0;
  var grammarIntermediateTotal = 0;
  var grammarAdvancedCount = 0;
  var grammarAdvancedTotal = 0;
  var readingBeginnerCount = 0;
  var readingBeginnerTotal = 0;
  var readingIntermediateCount = 0;
  var readingIntermediateTotal = 0;
  var readingAdvancedCount = 0;
  var readingAdvancedTotal = 0;

  pool.query(
    'SELECT user_id, username, email, score, point, avatar FROM users WHERE user_id = $1',
    [user_id],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server Error!'});
        return;
      }
      userData = results.rows[0];

      pool.query(
        'SELECT question_id, category_id, level_id, false AS completed FROM question ORDER BY question_id',
        (error, results1) => {
          if (error) {
            response.status(200).json({code: 201, message: 'Server Error!'});
            return;
          }

          listData = results1.rows;

          pool.query(
            'SELECT question_id, completed FROM question_progress WHERE user_id = $1 ORDER BY question_id',
            [user_id],
            (error, results2) => {
              if (error) {
                response
                  .status(200)
                  .json({code: 201, message: 'Server Error!'});
                return;
              }

              for (i = 0; i < listData.length; i++) {
                for (j = 0; j < results2.rows.length; j++) {
                  if (
                    listData[i].question_id === results2.rows[j].question_id
                  ) {
                    listData[i].completed = results2.rows[j].completed;
                  }
                }
                if (
                  listData[i].completed === true &&
                  listData[i].category_id === 1
                ) {
                  if (listData[i].level_id === 1) {
                    vocabularyBeginnerCount += 1;
                    vocabularyBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    vocabularyIntermediateCount += 1;
                    vocabularyIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    vocabularyAdvancedCount += 1;
                    vocabularyAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 2
                ) {
                  if (listData[i].level_id === 1) {
                    grammarBeginnerCount += 1;
                    grammarBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    grammarIntermediateCount += 1;
                    grammarIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    grammarAdvancedCount += 1;
                    grammarAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 3
                ) {
                  if (listData[i].level_id === 1) {
                    readingBeginnerCount += 1;
                    readingBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    readingIntermediateCount += 1;
                    readingIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    readingAdvancedCount += 1;
                    readingAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 1
                ) {
                  if (listData[i].level_id === 1) {
                    vocabularyBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    vocabularyIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    vocabularyAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 2
                ) {
                  if (listData[i].level_id === 1) {
                    grammarBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    grammarIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    grammarAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 3
                ) {
                  if (listData[i].level_id === 1) {
                    readingBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    readingIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    readingAdvancedTotal += 1;
                  }
                }
              }

              response.status(200).json({
                user_data: userData,
                vocabulary: {
                  beginner_count: vocabularyBeginnerCount,
                  beginner_total: vocabularyBeginnerTotal,
                  intermediate_count: vocabularyIntermediateCount,
                  intermediate_total: vocabularyIntermediateTotal,
                  advanced_count: vocabularyAdvancedCount,
                  advanced_total: vocabularyAdvancedTotal,
                },
                grammar: {
                  beginner_count: grammarBeginnerCount,
                  beginner_total: grammarBeginnerTotal,
                  intermediate_count: grammarIntermediateCount,
                  intermediate_total: grammarIntermediateTotal,
                  advanced_count: grammarAdvancedCount,
                  advanced_total: grammarAdvancedTotal,
                },
                reading: {
                  beginner_count: readingBeginnerCount,
                  beginner_total: readingBeginnerTotal,
                  intermediate_count: readingIntermediateCount,
                  intermediate_total: readingIntermediateTotal,
                  advanced_count: readingAdvancedCount,
                  advanced_total: readingAdvancedTotal,
                },
              });
            },
          );
        },
      );
    },
  );
};

const getAchievement = (request, response) => {
  pool.query(
    'SELECT achievement_id, achievement_name, achievement_desc, achievement_image FROM achievement ORDER BY achievement_id',
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server error!'});
        return;
      }
      response.status(200).json(results.rows);
    },
  );
};

const getUserStatus = (request, response) => {
  const user_id = request.body.userId;

  pool.query(
    'SELECT user_id, username, email, score, point, avatar FROM users WHERE user_id = $1',
    [user_id],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server error!'});
        return;
      }
      response.status(200).json(results.rows[0]);
    },
  );
};

const getShopProgress = (request, response) => {
  const user_id = request.body.userId;
  var userData = [];
  var shopData = [];
  var i = 0,
    j = 0;

  pool.query(
    'SELECT user_id, username, point, avatar FROM users WHERE user_id = $1',
    [user_id],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server error!'});
        return;
      }
      userData = results.rows[0];

      pool.query(
        'SELECT shop_id, shop_name AS name, shop_price AS price, shop_image AS image, false AS bought FROM shop ORDER BY shop_price, shop_name',
        (error, results2) => {
          if (error) {
            response.status(200).json({code: 201, message: 'Server error!'});
            return;
          }
          shopData = results2.rows;

          pool.query(
            'SELECT shop_id, user_id FROM shop_progress WHERE user_id = $1 ORDER BY shop_id',
            [user_id],
            (error, results3) => {
              if (error) {
                response
                  .status(200)
                  .json({code: 201, message: 'Server error!'});
                return;
              }

              if (results3.rows.length > 0) {
                for (i = 0; i < shopData.length; i++) {
                  for (j = 0; j < results3.rows.length; j++) {
                    if (shopData[i].shop_id === results3.rows[j].shop_id) {
                      shopData[i].bought = true;
                    }
                  }
                }
              }

              response.status(200).json({
                user_data: userData,
                shop_data: shopData,
              });
            },
          );
        },
      );
    },
  );
};

const shopCheckout = (request, response) => {
  const shop_id = request.body.shopId;
  const user_id = request.body.userId;
  var priceMinus = 0;

  pool.query(
    'SELECT shop_price AS price FROM shop WHERE shop_id = $1',
    [shop_id],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server error!'});
        return;
      }
      priceMinus = results.rows[0].price;
      pool.query(
        'INSERT INTO shop_progress(shop_id, user_id) VALUES ($1,$2)',
        [shop_id, user_id],
        (error, results2) => {
          if (error) {
            response.status(200).json({code: 201, message: 'Server error!'});
            return;
          }
          pool.query(
            'UPDATE users SET point = (point - $1) WHERE user_id = $2',
            [priceMinus, user_id],
            (error, results2) => {
              if (error) {
                response
                  .status(200)
                  .json({code: 201, message: 'Server error!'});
                return;
              }
              response.status(200).json({
                price_minus: priceMinus,
              });
              return;
            },
          );
        },
      );
    },
  );
};

const changeAvatar = (request, response) => {
  const user_id = request.body.userId;
  const avatar_image = request.body.userAvatar;

  pool.query(
    'UPDATE users SET avatar = $1 WHERE user_id = $2',
    [avatar_image, user_id],
    (error, results) => {
      if (error) {
        response.status(200).json({code: 201, message: 'Server error!'});
        return;
      }
      response.status(200).json({
        completed: true,
      });
    },
  );
};

module.exports = {
  signUp,
  signIn,
  getProfile,
  getAchievement,
  getUserStatus,
  getShopProgress,
  shopCheckout,
  changeAvatar,
};
