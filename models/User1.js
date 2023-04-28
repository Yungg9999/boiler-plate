const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //공백없애는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function( next ){
    var user = this
    //비밀번호 암호화

    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }
    else{
        next()
    }
})
// 비밀번호 비교
userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainPassword = 13242132 암호화된 비밀번호 = $2b$10$zD8AdTXC9kkSv7JG1xWDZess8GXVqZUdfW01lsg3WxB2ReOLO2zOW
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}   

// 토큰 생성
userSchema.methods.generateToken = function(cb){
    var user = this

    //jsonwebToken을 이용해서 token을 생성하기

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    //user._id + 'secretToken' => token 이 만들어진다
    //'secretToken'을 통해서 user._id가 무엇인지 알아낼 수 있음
    user.token = token
    //save가 콜백을 지원하지 않기 때문에 then catch 형식으로 구현 
    user.save().then(()=>{
        cb(null, user);
    }).catch((err)=>{
        return cb(err);
    })

}

// 토큰 부호화
userSchema.methods.findByToken = function(token, cb){
    var user = this;
    
    // 토큰을 decode화
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 id(decoded)를 이용해서 유저를 찾은 다음에 
        // 클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
    
        user.findOne({ "_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err)
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }