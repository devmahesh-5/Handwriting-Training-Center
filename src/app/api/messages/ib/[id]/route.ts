//deleting and updating messages

import Messages from "@/models/message.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";
import User from "@/models/users.models";
import { ApiError } from "@/utils/ApiError";

connectDB();

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await getDataFromToken(request);
        if (!user) {

            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const deletedMessage = await Messages.findByIdAndDelete(id);

        if (!deletedMessage) {
            throw new ApiError(404, "Message not deleted");
        }

        return NextResponse.
            json({
                message: "Message deleted successfully"
            }, { status: 200 });
    } catch (error: unknown) {
        console.error("Error deleting message:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error deleting message"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {

        const user = await getDataFromToken(request);

        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const body = await request.json();

        const { message } = body;

        const updatedMessage = await Messages.findByIdAndUpdate(id, { message }, { new: true });

        if (!message) {
            throw new ApiError(404, "Message not found");
        }

        return NextResponse.
            json({
                message: "Message updated successfully",
                updatedMessage
            }, {
                status: 200
            });
    } catch (error: unknown) {
        console.error("Error updating message:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error updating message"

            }, {
                status: error instanceof ApiError ? error.statusCode : 500
            });
    }

}