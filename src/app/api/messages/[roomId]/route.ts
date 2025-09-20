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


export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {

    try {
        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const roomId = (await params).roomId;

        const formData = await req.formData();
        const message = formData.get('message') as string;
        const messageFile = formData.get('messageFile') as File;

        if (!message?.trim() && !(messageFile instanceof File && messageFile.size > 0)) {
            throw new ApiError(400, "Message or messageFile is required");
        }

        let uploadedmessageFile = null;

        if (messageFile) {
            const tempFilePath = await saveBuffer(messageFile);
            uploadedmessageFile = await uploadOnCloudinary(tempFilePath);
            if (!uploadedmessageFile) {
                throw new ApiError(500, "Failed to upload message file");
            }
        }

        const newMessage = await Messages.create(
            {
                sender: user?._id,
                receiver: roomId,
                message,
                messageFile: uploadedmessageFile?.secure_url
            });
        if (!newMessage) {
            throw new ApiError(500, "Error sending message");
        }
        return NextResponse.
            json({
                message: "Message sent successfully",
                newMessage
            }, {
                status: 201
            });


    } catch (error: unknown) {
        return NextResponse.json({ message: error instanceof ApiError ? error.message : "Error sending message:" }, {
            status: error instanceof ApiError ? error.statusCode : 500
        });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const user = await getDataFromToken(req);//it is the middleware to check if the user is logged in
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const roomId = (await params).roomId;
        //lets change
        let messages = await Messages.aggregate(
            [
                {
                    $match: {
                        roomId : roomId,
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'sender',
                        foreignField: '_id',
                        as: 'sender',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    fullName: 1,
                                    profilePicture: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        sender: { $arrayElemAt: ['$sender', 0] }
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                },

                {
                    $project: {
                        sender: 1,
                        roomId: 1,
                        message: 1,
                        createdAt: 1,
                        messageFiles: 1,
                    }
                }
            ]
        )


        if (!messages) {
            throw new ApiError(500, 'Failed to get messages');
        }

        return NextResponse.
            json({
                message: "Messages fetched successfully",
                messages
            }, {
                status: 200
            });


    } catch (error: unknown) {
        console.error("Error fetching messages:", error);
        return NextResponse.
            json({
                message: error instanceof ApiError ? error.message : "Error fetching messages"
            }, {
                status: error instanceof ApiError ? error.statusCode : 500

            });
    }
}


