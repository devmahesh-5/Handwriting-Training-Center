import path from "path";


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
    role: string,
    skills?: string[] | null,
}

interface Classroom {
    _id: string;
    name: string;
    description: string;
    students: User[];
    status: 'Active' | 'Approved' | 'Pending';
    teacher: User;
    practiceSet?: string | null;
    course?: Course;
    totalXp: number;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

interface PracticeSet {
    _id: string,
    title: string,
    description: string,
    practiceEntries: PracticeEntry[],
    practiceEntry: string[],
    createdAt: Date,
    updatedAt: Date,
    __v: number
}

interface Course {
    _id: string,
    name: string,
    description: string,
    type: string,
    tags?: string[] | null,
    price: number,
    duration: string,
    thumbnail: string,
    practiceSet: PracticeSet,
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
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePicture: string | null;
  phone: string;
  isVerified: boolean;
  role: string;
  gender: string;
  created_at?: string;
}

interface Practice {
    _id: string,
    title: string,
    instruction: string,
    image: string,
    difficulty: string,
    tags: string[],
    xp: number,
    video:string,
    createdAt: date,
    updatedAt: date,
    __v: number
}


interface PracticeEntry {
    _id: string,
    practice: Practice,
    status: string,
    day: number,
    totalMarks: number
}

interface PracticeSolution {
    _id: string,
    student: User,
    classroom: Classroom,
    practice: Practice,
    submissionFile: string,
    marks?: number | 0,
    status: string,
    feedback?: string | null,
    createdAt: date,
    updatedAt: date,
    __v: number
}

interface Subscription {
    _id: string,
    student: User,
    classroom?: Classroom | null,
    paymentProof: string,
    status: string,
    course: Course,
    createdAt: date,
    updatedAt: date,
    __v: number
}

