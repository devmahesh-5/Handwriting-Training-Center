//get all my subscription

import mongoose, { isValidObjectId } from 'mongoose'
import { ApiError } from '@/utils/ApiError'
import connectDB from '@/db/index'
import { NextRequest, NextResponse } from 'next/server'
import getDataFromToken from '@/helpers/checkAuth';
import Subscription from '@/models/subscription.models';
import User from '@/models/users.models';

connectDB();

export async function GET(req: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(req);

        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not found");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "user not found");
        }

        if (user.role !== "Student") {
            throw new ApiError(403, "unauthorized access");
        }

        const subscriptions = await Subscription.aggregate([
            {
                $match: { student: userId }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course",
                    foreignField: "_id",
                    as: "course"
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student"
                }
            },
            {
                $addFields: { 
                    course: { $arrayElemAt: ["$course", 0] } ,
                    student: { $arrayElemAt: ["$student", 0] }
                }

            },
            {
                $project: {
                    course: 1,
                    createdAt: 1,
                    status: 1,
                    paymentProof: 1,
                    student: 1
                }
            }
        ])

        if (!subscriptions) {
            throw new ApiError(500, "Something went wrong while fetching subscriptions");
        }

        return NextResponse.json(
            {
                message: "Subscriptions fetched successfully",
                subscriptions
            },
            {
                status: 200
            }
        )
    } catch (error: unknown) {
        return NextResponse.json(
            {
                message: error instanceof ApiError ? error.message : "Error getting subscriptions",
            },
            {
                status: error instanceof ApiError ? error.statusCode : 500
            }
        );
    }

}
