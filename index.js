const express = require('express');
const app = express();
const port = 3500;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User1");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());
const mongoose = require('mongoose');

mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!~~~~test')
})

// 회원가입 기능
app.post('/api/users/register', (req, res) => {
  
  //회원가입에 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.

    const user = new User(req.body);
        //user모델에 정보가 저장됨
        //실패 시, 실패한 정보를 보내줌
        user.save().then(()=>{
            res.status(200).json({
                success:true
            })
        }).catch((err)=>{
            return res.json({success:false, err})
        });
})
// 로그인 기능
app.post('/api/users/login',(req, res) =>{
  // 요청된 이메일을 데이터베이스 찾기
  User.findOne({email: req.body.email})
  .then(docs=>{
      if(!docs){
          return res.json({
              loginSuccess: false,
              messsage: "제공된 이메일에 해당하는 유저가 없습니다."
          })
      }
      docs.comparePassword(req.body.password, (err, isMatch) => {
          if(!isMatch) return res.json({loginSuccess: false, messsage: "비밀번호가 틀렸습니다."})
          // Password가 일치하다면 토큰 생성
          docs.generateToken((err, user)=>{
              if(err) return res.status(400).send(err);
              // 토큰을 저장
              res.cookie("x_auth", user.token)
              .status(200)
              .json({loginSuccess: true, userId: user._id})
          })
      })
  })
  .catch((err)=>{
      return res.status(400).send(err);
  })
})

// auth 기능
// role 1 -> Admin, role 2 -> 특정 부서 Admin
// role 0 -> 일반 role, 0이 아니면 -> Admin
app.get('/api/users/auth', auth, (req, res) =>{
  //미들웨어 auth는 현재 접속중인지 판단
  //여기까지 미들웨어(auth)를 통과해 왔다는 것은 Authentication이 Ture라는 것
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})
// 로그아웃 기능 - DB의 토큰을 삭제
app.get('/api/users/logout', auth, (req, res) =>{
  // findOneAndUpdate -> DB에서 찾은 다음 변경하는 함수
  User.findOneAndUpdate({ _id: req.user._id},{token: ""}).then(()=>{
    return res.status(200).send({
      success: true 
    })
  }).catch((err) =>{
    return res.json({ success: false, err});
  })
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
