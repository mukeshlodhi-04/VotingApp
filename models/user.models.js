const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
    },
    adharNo:{
        type: String,
        require: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type:String,
        require: true
    },
    age:{
        type: Number,
        required: true
    },
    role:{
        type: String,
        enum: ['voter','admin'],
        default : 'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }

});

userSchema.pre('save',async function(next){
    const user = this;

    if(!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hasedpassword = await bcrypt.hash(user.password,salt);
        user.password = hasedpassword;
        next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.comparePassword = async function(cpassword){
    try {
        const ismatch = bcrypt.compare(cpassword,this.password);
        return ismatch;
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model('User',userSchema);


module.exports = User;