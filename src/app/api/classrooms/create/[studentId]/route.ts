import mongoose from "mongoose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/db/index";
import Classroom from "@/models/classroom.models";
import getDataFromToken from "@/helpers/checkAuth";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";
import Subscription from "@/models/subscription.models";
import Course from "@/models/course.models";

connectDB();

export async function POST(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
    try {
        const { name, description } = await req.json();
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const subscriptionId = searchParams.get("subscriptionId");
        const studentId = (await params).studentId;

        if (!name || !description) {
            throw new ApiError(400, "Name and description are required");
        }
        const { _id: userId } = await getDataFromToken(req);

        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        if (!mongoose.isValidObjectId(courseId)) {
            throw new ApiError(400, "Invalid course id")
        }

        if (!mongoose.isValidObjectId(studentId)) {
            throw new ApiError(400, "Invalid student id")
        }

        const user = await User.findById(userId);

        if (user.role !== "Admin") {
            throw new ApiError(403, "Unauthorized access");
        }

        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }

        const classroom = await Classroom.create({
            name,
            description,
            course: courseId,
            status: "Approved",
            students: [studentId],
            subscription: subscriptionId
        });

        if (!classroom) {
            throw new ApiError(500, "could not create classroom")
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId,
            {
                $addToSet: { classroom: classroom._id },
                $set: { status: "Subscribed" },
            },
            {
                new: true
            });

        if (!updatedSubscription) {
            throw new ApiError(500, "could not update subscription");
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $inc: { enrolled: 1 },
            },
            {
                new: true
            });


        if (!updatedCourse) {
            throw new ApiError(500, "could not update course");
        }


        const updatedStudent = await User.findByIdAndUpdate(studentId,
            {
                $inc: { totalClassAttended: 1 },
            },
            {
                new: true
            });



        if (!updatedStudent) {
            throw new ApiError(500, "could not update student");
        }

        return NextResponse.json(classroom);

    } catch (error: unknown) {

        console.error("Error creating classroom:", error);


        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }


        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}