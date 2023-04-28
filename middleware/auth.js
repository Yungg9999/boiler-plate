let auth = (req, res, next) => {
const { User } = require('../models/User1')
    //인증처리를 하는 곳

    // 인증 순서
    // 클라이언트 쿠키에서 토큰을 가지고 오기 
    let token = req.cookies.x_auth;
    // 토큰을 복호화한 후 유저를 찾기
    User.findByToken(token, function(err, user){
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true})
        
        //유저가 있으면 
        req.token = token;  //index의 auth에서 req.token, req.user를 사용하기위해 넣어줌
        req.user = user;
        //app.get('/api/users/auth', auth, (req, res)에서 auth가 끝나고 다음 콜백으로 넘어가기 위해 next
        next();

    })
    // 유저가 있으면 인증 OK

    // 유저가 없으면 인증 NO
}

module.exports = { auth }