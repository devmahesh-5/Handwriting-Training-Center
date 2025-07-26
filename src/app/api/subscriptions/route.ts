//get all my subscription

import mongoose, { isValidObjectId } from 'mongoose'
import { ApiError } from '@/utils/ApiError'
import connectDB from '@/db/index'
import { NextRequest, NextResponse } from 'next/server'
import getDataFromToken from '@/helpers/checkAuth';
import Subscription from '@/models/subscription.models';

connectDB();

export async function GET(req: NextRequest) {
    try {
        const { _id: userId } = await getDataFromToken(req);

        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not found");
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
                $lookup: {
                    from: "payments",
                    localField: "payment",
                    foreignField: "_id",
                    as: "payment"
                }
            },
            {
                $addFields: { course: { $arrayElemAt: ["$course", 0] } }
            },
            {
                $project: {
                    course: 1,
                    createdAt: 1,
                    status: 1,
                    payment: 1
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
