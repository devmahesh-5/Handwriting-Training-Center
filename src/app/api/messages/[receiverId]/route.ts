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


export async function POST(req: NextRequest, { params }: { params: Promise<{ receiverId: string }> }) {

    try {
        const user = await getDataFromToken(req);
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }

        const receiverId = (await params).receiverId;

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
                receiver: receiverId,
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ receiverId: string }> }) {
    try {
        const user = await getDataFromToken(req);//it is the middleware to check if the user is logged in
        if (!user) {
            throw new ApiError(401, "User Session expired or not logged in");
        }
        if (user.isVerified === false) {
            throw new ApiError(401, "User is not verified");
        }
        const sender = user?._id;
        const receiver = (await params).receiverId;
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit') || 10;

        if (!isValidObjectId(sender) || !isValidObjectId(receiver)) {
            throw new Error('Invalid user id');
        }
        //lets change
        let messages = await Messages.aggregate(
            [
                {
                    $match: {
                        $or: [
                            { sender: new mongoose.Types.ObjectId(sender), receiver: new mongoose.Types.ObjectId(receiver) },
                            { sender: new mongoose.Types.ObjectId(receiver), receiver: new mongoose.Types.ObjectId(sender) }
                        ]
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
                                    fullName: 1,
                                    profilePicture: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'receiver',
                        foreignField: '_id',
                        as: 'receiver',
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        sender: { $arrayElemAt: ['$sender', 0] },
                        receiver: { $arrayElemAt: ['$receiver', 0] }
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },

                // {
                //     $skip: (Number(page) - 1) * Number(limit)
                // },
                {
                    $limit: Number(limit)
                },

                {
                    $project: {
                        sender: 1,
                        receiver: 1,
                        message: 1,
                        createdAt: 1,
                        messageFiles: 1,
                        isRead: 1
                    }
                }
            ]
        )

        messages = messages.reverse();

        const messageCount = await Messages.countDocuments({
            $or: [
                { sender: new mongoose.Types.ObjectId(sender), receiver: new mongoose.Types.ObjectId(receiver) },
                { sender: new mongoose.Types.ObjectId(receiver), receiver: new mongoose.Types.ObjectId(sender) }
            ]
        })

        const updatedMessages = await Messages.updateMany({
            $or: [
                { sender: new mongoose.Types.ObjectId(sender), receiver: new mongoose.Types.ObjectId(receiver) },
                { sender: new mongoose.Types.ObjectId(receiver), receiver: new mongoose.Types.ObjectId(sender) },
            ]
        },
            {
                $set: {
                    isRead: true
                }
            },
            {
                new: true
            }
        )

        // console.log(updatedMessages);

        if (!updatedMessages) {
            throw new ApiError(
                500,
                'could not mark messages as read'
            )
        }

        if (!messages) {
            throw new ApiError(500, 'Failed to get messages');
        }

        return NextResponse.
            json({
                message: "Messages fetched successfully",
                messages, messageCount
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


