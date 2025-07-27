//create report to user(teacher or student)
// get all reports
import Report from "@/models/reports.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
connectDB();

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const body = await req.json();
        const user = await getDataFromToken(req);
        const {userId} = await params;
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401,"User is not verified");
        }
        const { report } = body;
        if(!report || report ===undefined){
            throw new ApiError(400,"Report is required");
        }

        const reportData = await Report.create({
            student: user._id,
            report,
            teacher: userId
        });

        return NextResponse.
            json({
                message: "Report created successfully",
                reportData
            }, {
                status: 201
            });
    } catch (error: unknown) {
        console.error("Error creating report:", error);
        return NextResponse.
            json({
                message:error instanceof ApiError ? error.message : "Error creating report"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }

}

