import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
connectDB();
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getDataFromToken(req);
        if (!user) {
            throw new Error("User Session expired or not logged in");
        }

        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        const classroom = await Classroom.findById(params.id);
        return NextResponse.json({ message: "Classroom fetched successfully", classroom }, { status: 200 });
    } catch (error: any) {
        console.error("Error creating classroom:", error);
        return NextResponse.json({ message: error.message || "Error creating classroom" }, { status: 500 });
        
    }
}