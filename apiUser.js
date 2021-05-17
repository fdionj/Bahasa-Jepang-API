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
  var hiragana1BeginnerCount = 0;
  var hiragana1BeginnerTotal = 0;
  var hiragana1IntermediateCount = 0;
  var hiragana1IntermediateTotal = 0;
  var hiragana1AdvancedCount = 0;
  var hiragana1AdvancedTotal = 0;
  var hiragana2BeginnerCount = 0;
  var hiragana2BeginnerTotal = 0;
  var hiragana2IntermediateCount = 0;
  var hiragana2IntermediateTotal = 0;
  var hiragana2AdvancedCount = 0;
  var hiragana2AdvancedTotal = 0;
  var hiragana3BeginnerCount = 0;
  var hiragana3BeginnerTotal = 0;
  var hiragana3IntermediateCount = 0;
  var hiragana3IntermediateTotal = 0;
  var hiragana3AdvancedCount = 0;
  var hiragana3AdvancedTotal = 0;
  var katakana1BeginnerCount = 0;
  var katakana1BeginnerTotal = 0;
  var katakana1IntermediateCount = 0;
  var katakana1IntermediateTotal = 0;
  var katakana1AdvancedCount = 0;
  var katakana1AdvancedTotal = 0;
  var katakana2BeginnerCount = 0;
  var katakana2BeginnerTotal = 0;
  var katakana2IntermediateCount = 0;
  var katakana2IntermediateTotal = 0;
  var katakana2AdvancedCount = 0;
  var katakana2AdvancedTotal = 0;
  var katakana3BeginnerCount = 0;
  var katakana3BeginnerTotal = 0;
  var katakana3IntermediateCount = 0;
  var katakana3IntermediateTotal = 0;
  var katakana3AdvancedCount = 0;
  var katakana3AdvancedTotal = 0;
  var tangoBeginnerCount = 0;
  var tangoBeginnerTotal = 0;
  var tangoIntermediateCount = 0;
  var tangoIntermediateTotal = 0;
  var tangoAdvancedCount = 0;
  var tangoAdvancedTotal = 0;
  var kaiwaBeginnerCount = 0;
  var kaiwaBeginnerTotal = 0;
  var kaiwaIntermediateCount = 0;
  var kaiwaIntermediateTotal = 0;
  var kaiwaAdvancedCount = 0;
  var kaiwaAdvancedTotal = 0;

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
                    hiragana1BeginnerCount += 1;
                    hiragana1BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana1IntermediateCount += 1;
                    hiragana1IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana1AdvancedCount += 1;
                    hiragana1AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 2
                ) {
                  if (listData[i].level_id === 1) {
                    hiragana2BeginnerCount += 1;
                    hiragana2BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana2IntermediateCount += 1;
                    hiragana2IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana2AdvancedCount += 1;
                    hiragana2AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 3
                ) {
                  if (listData[i].level_id === 1) {
                    hiragana3BeginnerCount += 1;
                    hiragana3BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana3IntermediateCount += 1;
                    hiragana3IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana3AdvancedCount += 1;
                    hiragana3AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 4
                ) {
                  if (listData[i].level_id === 1) {
                    katakana1BeginnerCount += 1;
                    katakana1BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana1IntermediateCount += 1;
                    katakana1IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana1AdvancedCount += 1;
                    katakana1AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 5
                ) {
                  if (listData[i].level_id === 1) {
                    katakana2BeginnerCount += 1;
                    katakana2BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana2IntermediateCount += 1;
                    katakana2IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana2AdvancedCount += 1;
                    katakana2AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 6
                ) {
                  if (listData[i].level_id === 1) {
                    katakana3BeginnerCount += 1;
                    katakana3BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana3IntermediateCount += 1;
                    katakana3IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana3AdvancedCount += 1;
                    katakana3AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 7
                ) {
                  if (listData[i].level_id === 1) {
                    tangoBeginnerCount += 1;
                    tangoBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    tangoIntermediateCount += 1;
                    tangoIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    tangoAdvancedCount += 1;
                    tangoAdvancedTotal += 1;
                  }
                }else if (
                  listData[i].completed === true &&
                  listData[i].category_id === 8
                ) {
                  if (listData[i].level_id === 1) {
                    kaiwaBeginnerCount += 1;
                    kaiwaBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    kaiwaIntermediateCount += 1;
                    kaiwaIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    kaiwaAdvancedCount += 1;
                    kaiwaAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 1
                ) {
                  if (listData[i].level_id === 1) {
                    hiragana1BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana1IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana1AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 2
                ) {
                  if (listData[i].level_id === 1) {
                    hiragana2BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana2IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana2AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 3
                ) {
                  if (listData[i].level_id === 1) {
                    hiragana3BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    hiragana3IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    hiragana3AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 4
                ) {
                  if (listData[i].level_id === 1) {
                    katakana1BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana1IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana1AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 5
                ) {
                  if (listData[i].level_id === 1) {
                    katakana2BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana2IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana2AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 6
                ) {
                  if (listData[i].level_id === 1) {
                    katakana3BeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    katakana3IntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    katakana3AdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 7
                ) {
                  if (listData[i].level_id === 1) {
                    tangoBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    tangoIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    tangoAdvancedTotal += 1;
                  }
                } else if (
                  listData[i].completed === false &&
                  listData[i].category_id === 8
                ) {
                  if (listData[i].level_id === 1) {
                    kaiwaBeginnerTotal += 1;
                  } else if (listData[i].level_id === 2) {
                    kaiwaIntermediateTotal += 1;
                  } else if (listData[i].level_id === 3) {
                    kaiwaAdvancedTotal += 1;
                  }
                }
              }

              response.status(200).json({
                user_data: userData,
                hiragana1: {
                  beginner_count: hiragana1BeginnerCount,
                  beginner_total: hiragana1BeginnerTotal,
                  intermediate_count: hiragana1IntermediateCount,
                  intermediate_total: hiragana1IntermediateTotal,
                  advanced_count: hiragana1AdvancedCount,
                  advanced_total: hiragana1AdvancedTotal,
                },
                hiragana2: {
                  beginner_count: hiragana2BeginnerCount,
                  beginner_total: hiragana2BeginnerTotal,
                  intermediate_count: hiragana2IntermediateCount,
                  intermediate_total: hiragana2IntermediateTotal,
                  advanced_count: hiragana2AdvancedCount,
                  advanced_total: hiragana2AdvancedTotal,
                },
                hiragana3: {
                  beginner_count: hiragana3BeginnerCount,
                  beginner_total: hiragana3BeginnerTotal,
                  intermediate_count: hiragana3IntermediateCount,
                  intermediate_total: hiragana3IntermediateTotal,
                  advanced_count: hiragana3AdvancedCount,
                  advanced_total: hiragana3AdvancedTotal,
                },
                katakana1: {
                  beginner_count: katakana1BeginnerCount,
                  beginner_total: katakana1BeginnerTotal,
                  intermediate_count: katakana1IntermediateCount,
                  intermediate_total: katakana1IntermediateTotal,
                  advanced_count: katakana1AdvancedCount,
                  advanced_total: katakana1AdvancedTotal,
                },
                katakana2: {
                  beginner_count: katakana2BeginnerCount,
                  beginner_total: katakana2BeginnerTotal,
                  intermediate_count: katakana2IntermediateCount,
                  intermediate_total: katakana2IntermediateTotal,
                  advanced_count: katakana2AdvancedCount,
                  advanced_total: katakana2AdvancedTotal,
                },
                katakana3: {
                  beginner_count: katakana3BeginnerCount,
                  beginner_total: katakana3BeginnerTotal,
                  intermediate_count: katakana3IntermediateCount,
                  intermediate_total: katakana3IntermediateTotal,
                  advanced_count: katakana3AdvancedCount,
                  advanced_total: katakana3AdvancedTotal,
                },
                tango: {
                  beginner_count: tangoBeginnerCount,
                  beginner_total: tangoBeginnerTotal,
                  intermediate_count: tangoIntermediateCount,
                  intermediate_total: tangoIntermediateTotal,
                  advanced_count: tangoAdvancedCount,
                  advanced_total: tangoAdvancedTotal,
                },
                kaiwa: {
                  beginner_count: kaiwaBeginnerCount,
                  beginner_total: kaiwaBeginnerTotal,
                  intermediate_count: kaiwaIntermediateCount,
                  intermediate_total: kaiwaIntermediateTotal,
                  advanced_count: kaiwaAdvancedCount,
                  advanced_total: kaiwaAdvancedTotal,
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
