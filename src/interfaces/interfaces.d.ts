interface User {
    _id: string,
    fullName: string,
    email: string,
    username: string,
    googleId: string,
    isVerified: boolean,
    refreshToken: string,
    forgetPasswordToken: string,
    forgetPasswordTokenExpiry: number,
    createdAt: date,
    updatedAt: date,
    __v: number,
    otp: string,
    otpExpiry: number,
    sessionId:number,
    unVerified_at: number
    verificationAttempts: number
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
    __v: number
}

interface Course {
    _id: string,
    name: string,
    description: string,
    type: string,
    price: number,
    duration: number,
    thumbnail: string,
    practiceSet: string[],
    createdAt: date,
    updatedAt: date,
    __v: number
}

interface Payment {
    _id: string,
    student: string,
    Classroom: string,
    amount: number,
    status: string,
    paymentGateway: string,
    transaction_uuid: string,
    subscription: string,
    createdAt: date,
    updatedAt: date,
    __v: number
}
interface userData {
    _id: string,
    fullName: string,
    email: string,
    username: string,
    phone: string,
    gender: string,
    role: string,
    isVerified: boolean,
    profilePicture: string | null,
    
}
