import mongoose from "mongoose";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import PracticeEntry from "@/models/practiceEntry.models";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();


export async function POST(req: NextRequest) {
    const user = await getDataFromToken(req);
    if (!user) {
        return NextResponse.json(
            {
                message: "user not found",
            },
            {
                status: 404,
            }
        );
    }

    if (user.isVerified === false || user.role !== "admin") {
        return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
    }

    try {
        const { title, description } = await req.json();
        const practiceSet = await PracticeEntry.create({ title, description });
        return NextResponse.
            json({
                message: "Classroom created successfully",
                practiceSet
            },
                {
                    status: 201

                });

    } catch (error: any) {

        console.error("Error creating classroom:", error);
        return NextResponse.
            json({
                message: error.message || "Error creating classroom"

            },
                {
                    status: 500
                });
    }

}
