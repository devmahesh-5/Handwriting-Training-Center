//create report to user(teacher or student)
// get all reports
import Report from "@/models/reports.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const body = await req.json();
        const user = await getDataFromToken(req);
        const userId = params.userId;
        if (!user) {
            throw new Error("User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new Error("User is not verified");
        }
        const { report } = body;
        [report].some(field => !field || field === undefined) && NextResponse.json({ message: "All fields are required" }, { status: 400 });
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
    } catch (error: any) {
        console.error("Error creating report:", error);
        return NextResponse.
            json({
                message: error.message || "Error creating report"
            }, {
                status: 500
            });
    }
}

