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
const User = mongoose.model('User', userSchema)

module.exports = { User }