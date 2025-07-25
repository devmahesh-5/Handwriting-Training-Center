import Report from "@/models/reports.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import { isValidObjectId } from "mongoose";
connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {
        throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }
        const reports = await Report.aggregate(
            [
                {
                    $lookup:{
                        from:"users",
                        localField:"student",
                        foreignField:"_id",
                        as:"student"
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"teacher",
                        foreignField:"_id",
                        as:"teacher"
                    }
                },
                {
                    $project:{
                        student:{$arrayElemAt:["$student",0]},
                        report:1,
                        teacher:{$arrayElemAt:["$teacher",0]},
                        status:1
                    }
                }
            ]
        )
        return NextResponse.
            json({
                message: "Reports fetched successfully", reports
            }, {
                status: 200
            });
    } catch (error:unknown) {
        console.error("Error getting reports:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error getting reports"

            }, {
                status: error instanceof ApiError ? error.statusCode : 500

            });
    }
}
