import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
connectDB();

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
    try {
        const classroom = await Classroom.find({ students: params.studentId });
        return NextResponse.json({ message: "Classroom fetched successfully", classroom }, { status: 200 });
    } catch (error) {
        console.error("Error creating classroom:", error);
        return NextResponse.json({ message: "Error creating classroom" }, { status: 500 });
    }
}