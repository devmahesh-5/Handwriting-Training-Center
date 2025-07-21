interface User {
    _id: string,
    fullName: string,
    email: string,
    username: string,
    googleId: string,
    isVerified: boolean,
    refreshToken: string,
    forgetPasswordToken: string,
    forgetPasswordTokenExpiry: Number,
    createdAt: date,
    updatedAt: date,
    __v: Number,
    otp: string,
    otpExpiry: Number,
    sessionId:Number,
    unVerified_at: Number
    verificationAttempts: Number
    password: string,
    address: string,
    phone: string,
    gender: string,
    profilePicture: string,
    role: string
}

interface Classroom {
    _id: string,
    name: string,
    description: string,
    teacher: string,
    students: string[],//array
    course: string,
    payment: string,
    subscription: string,
    status: string,
    createdAt: date,
    updatedAt: date,
    __v: Number
}

interface Course {
    _id: string,
    name: string,
    description: string,
    type: string,
    price: Number,
    duration: Number,
    thumbnail: string,
    practiceSet: string[],
    createdAt: date,
    updatedAt: date,
    __v: Number
}

interface Payment {
    _id: string,
    student: string,
    Classroom: string,
    amount: Number,
    status: string,
    paymentGateway: string,
    transaction_uuid: string,
    subscription: string,
    createdAt: date,
    updatedAt: date,
    __v: Number
}

