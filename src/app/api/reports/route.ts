import Report from "@/models/reports.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getDataFromToken(request);
        if (!user) {

            return NextResponse.
                json({
                    message: "Unauthenticated User"

                }, {
                    status: 401

                });
        }
        if (user.isVerified === false) {
            return NextResponse.
                json({
                    message: "User is not verified"

                }, {
                    status: 401

                });
        }
        const reports = await Report.find({ teacher: user._id });
        return NextResponse.
            json({
                message: "Reports fetched successfully", reports
            }, {
                status: 200
            });
    } catch (error) {
        console.error("Error getting reports:", error);
        return NextResponse.
            json({
                message: "Error getting reports"

            }, {
                status: 500

            });
    }
}