//get total students,total teachers,total classrooms courses,recent registered users,recently created classrooms,subscription (group by status)
import connectDB from "@/db/index";
import User from "@/models/users.models.js";
import Classroom from "@/models/classroom.models.js";
import Course from "@/models/course.models.js";
import Subscription from "@/models/subscription.models.js";

import getDataFromToken from "@/helpers/checkAuth";
import { NextResponse, NextRequest } from "next/server";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function GET(req: NextRequest) {
    
    try {

        const user = await getDataFromToken(req);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }

        if (user.role !== "Admin") {
            throw new ApiError(401, "only admin can get dashboard data");
        }

        const students = await User.find({role:"Student"}).select("_id createdAt")
        const teachers = await User.find({role:"Teacher"}).select("_id createdAt")
        const classrooms = await Classroom.find({}).select("_id createdAt")
        const courses = await Course.find({}).select("_id createdAt")

        const subscriptions = await Subscription.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ])

        const recentStudents = await User.aggregate([
            {
                $match: {
                    role: "Student"
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    role: 1,
                    fullName: 1,
                    email: 1,
                    profilePicture: 1
                }
            }
        ])

        const recentTeachers = await User.aggregate([
            {
                $match: {
                    role: "Teacher"
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    role: 1,
                    fullName: 1,
                    email: 1,
                    profilePicture: 1,
                    skills: 1
                }
            }
        ])

        const topCourses = await Course.aggregate([
            {
                $sort: {
                    enrolled: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    enrolled: 1
                }
            }
        ])

        const courseEarning = await Course.aggregate([
            {
                $group:{
                    _id: null,
                    totalEarning: {
                        $sum: "$price"
                    }
                }
            }
        ])

        const leaderBoard = await User.aggregate([
            {
                $match:{
                    role:"Student"
                }
            },
            {
                $sort:{
                    xps:-1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    role: 1,
                    fullName: 1,
                    email: 1,
                    profilePicture: 1,
                    xps: 1
                }
            }
        ])

        //teachers with attended classrooms

        const teachersWithClassrooms = await User.aggregate([
            {
                $match: {
                    role: "Teacher"
                }
            },
            {
                $lookup: {
                    from: "classrooms",
                    localField: "_id",
                    foreignField: "teacher",
                    as: "classrooms"
                }
            }
        ])

        return NextResponse.json({ message: "Dashboard data fetched successfully", dashboard: {students, teachers, classrooms, courses, subscriptions, recentStudents, recentTeachers, topCourses, courseEarning, leaderBoard, teachersWithClassrooms} }, { status: 200 });



        
    } catch (error: unknown) {
        console.error("Error getting dashboard data:", error);
        return NextResponse.json({ message: error instanceof ApiError ? error.message : "Error getting dashboard data" }, { status: error instanceof ApiError ? error.statusCode : 500 });
    }
}