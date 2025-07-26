
import connectDB from "@/db/index";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users.models";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import Classroom from "@/models/classroom.models";
import subscription from "@/models/subscription.models";
import Payment from "@/models/payment.models";
import Report from "@/models/reports.models";
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function GET(req: NextRequest) {
    try {
        const user= await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401,"User Session expired or not logged in");
        }

        //what things to include in the admin dashboard??
        //1. total number of classrooms
        //2. total number of students
        //3. all of teachers and there attended classrooms
        //4. total number of reports [pending and resolved]
        //5. all courses and student enrolled in them
        //6.practice set 
        //7.practice
        //
        //lets first create index on student and classroom
        await Classroom.syncIndexes();
        await User.syncIndexes();
        await subscription.syncIndexes();
        await Payment.syncIndexes();
        await Report.syncIndexes();

        const totalTeachers = await User.countDocuments({ role: "teacher" });
        const totalStudents = await User.countDocuments({ role: "student" });
        const myUserDashboard = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $facet :{
                    classrooms: [
                        {
                            $lookup: {
                                from: "classrooms",
                                localField: "_id",
                                foreignField: "students",
                                as: "classrooms",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "teacher",
                                            foreignField: "_id",
                                            as: "teacherData"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $match:{
                                classrooms: {
                                    $ne: []
                                }
                            }
                        },
                        {
                            $count: "totalClassrooms"
                        }
                    ],
                    reports: [
                        {
                            $lookup: {
                                from: "reports",
                                localField: "_id",
                                foreignField: "student",
                                as: "reports"
                            }
                        },
                        {
                            $match: {
                                reports: {
                                    $ne: []
                                }
                            }
                        },
                        {
                            $count: "totalReports"
                        }
                    ],
                    Payments:[
                        {
                            $lookup: {
                                from: "payments",
                                localField: "_id",
                                foreignField: "student",
                                as: "payments"
                            }
                        },
                        {
                            $match:{
                                payments:{
                                    $ne:[]
                                }
                            }
                        },
                        {
                            $count: "totalPayments"
                        }
                    ],
                    subscriptions:[
                        {
                            $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "student",
                                as: "subscriptions"
                            }
                        },
                        {
                            $match:{
                                subscriptions:{
                                    $ne:[]
                                }
                            }
                        },
                        {
                            $count: "totalSubscriptions"
                        }
                    ],
                }
            },
            {
                $project: {
                    classrooms: 1,
                    reports: 1,
                    Payments:1,
                    subscriptions:1
                }
            }

        ])

        const totalGlobal = {
            totalTeachers,
            totalStudents
        }


        if(!myUserDashboard){
            throw new ApiError(404, "User not found");
        }

        return NextResponse.json(
            {
                message: "User dashboard fetched successfully",
                data: myUserDashboard,totalGlobal
            },
            {
                status: 200,
            }
        );
        
    } catch (error: unknown) {
        console.error("Error getting user:", error);
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error getting user",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500,
            }
        );
    }
}

