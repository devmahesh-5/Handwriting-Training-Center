import Report from "@/models/reports.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
connectDB();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const user = await getDataFromToken(req);
        if (!user) {
            throw new Error("User Session expired or not logged in");
        }
        if (user.isVerified === false || user.role !=="admin" || !isValidObjectId(id)) {
            throw new Error("User is not verified");
        }
        const reportData = await Report.findByIdAndUpdate(id,
            {
                $set: {
                    status: "resolved",
                },
            },
            {
                new: true
            });
        return NextResponse.
            json({
                message: "Report updated successfully",
                reportData
            },
                {
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
