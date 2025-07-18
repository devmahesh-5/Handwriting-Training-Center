import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
connectDB();
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const classroom = await Classroom.findById(params.id);
        return NextResponse.json({ message: "Classroom fetched successfully", classroom }, { status: 200 });
    } catch (error) {
        console.error("Error creating classroom:", error);
        return NextResponse.json({ message: "Error creating classroom" }, { status: 500 });
        
    }
}