import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId :{
        type: String,
    },
    profilePicture: {
        type: String,
    },
    phone:{
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
    },
    isVerfied: {
        type: Boolean,
        default: false
    },
    refreshToken:{
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['Teacher','Student'],
        default: 'Student',
    },
    gender:{
        type: String,
        enum: ['Male', 'Female'],
        default: 'Male',
    },
    forgetPasswordToken: {
        type: String,
        default: null,
    },
    forgetPasswordExpiry: {
        type: Date,
        default: null,
    },
    verificationAttempts:{
        type: Number,
        default: 0
    },
    unVerified_at:{
        type: Date,
        default: null
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    sessionId: {
        type: Number,
        default:new Date().getTime()
    }
},{ timestamps: true });



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken =  function () {
    
    return jwt.sign({ id: this._id,sessionId:this.sessionId },
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id },
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;