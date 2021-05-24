const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const apiGlobal = require('./apiGlobal');
const apiUser = require('./apiUser');

const cors = require('cors');

app.set('trust proxy', 1);

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept',
//   );
//   next();
// });

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());

app.use(cors());

app.get('/', (request, response) => {
  response.json({info: 'Node.js, Express, and Postgres API'});
});

// API GLOBAL
app.get('/category', cors(), apiGlobal.getAllCategory);
app.post('/questionList', cors(), apiGlobal.getQuestionListByCategory);
app.post('/exercise', cors(), apiGlobal.getQuestionDetail);
app.post('/checkanswer', cors(), apiGlobal.checkAnswer);
app.get('/leaderboard', cors(), apiGlobal.getLeaderboard);
app.post('/insertAchievement', cors(), apiGlobal.insertAchievement);
app.post('/insertShop', cors(), apiGlobal.insertShop);
app.post('/insertCategory', cors(), apiGlobal.insertCategory);

// API USER
app.post('/signUp', cors(), apiUser.signUp);
app.post('/signIn', cors(), apiUser.signIn);
app.post('/profile', cors(), apiUser.getProfile);
app.get('/achievement', cors(), apiUser.getAchievement);
app.post('/userstatus', cors(), apiUser.getUserStatus);
app.post('/shop', cors(), apiUser.getShopProgress);
app.post('/checkout', cors(), apiUser.shopCheckout);
app.post('/changeavatar', cors(), apiUser.changeAvatar);

app.listen(process.env.PORT || 3000, function() {
  console.log(
    'Express server listening on port %d in %s mode',
    this.address().port,
    app.settings.env,
  );
});
