
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

       
        //lets first create index on student and classroom
        await Classroom.syncIndexes();
        await User.syncIndexes();
        await subscription.syncIndexes();
        await Report.syncIndexes();

        let leaderBoard;

        if(user.role === "Student"){
            leaderBoard = await User.aggregate([
                {
                    $match: {
                        role: "Student"
                    }
                },
                {
                    $sort :{
                        xps:-1
                    }
                },
                {
                    $limit: 10
                }
            ])
        }else if(user.role === "Teacher"){
            leaderBoard = await User.aggregate([
                {
                    $match: {
                        role: "Teacher"
                    }
                },
                {
                    $sort :{
                        totalClassAttended:-1
                        
                    }
                },
                {
                    $limit: 10
                }
            ])
        }

        if(!leaderBoard){
            throw new ApiError(404, "User not found");
        }

        return NextResponse.json(
            {
                message: "User leaderboard fetched successfully",
                leaderBoard
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

