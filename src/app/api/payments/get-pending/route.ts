import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import Payment from "@/models/payment.models";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";


connectDB();


export async function GET(req: NextRequest) {
    try {
        const {_id} = await getDataFromToken(req);

        const user = await User.findById(_id);

        if (!user) {
            throw new ApiError(404, "user not found");
        }

        if (user.role !== "admin") {
            throw new ApiError(403, "unauthorized access");
        }

        const payments = await Payment.aggregate(
            [
                {
                    $match: { status: "pending" }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "student",
                        foreignField: "_id",
                        as: "student"
                    }
                },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "subscription",
                        foreignField: "_id",
                        as: "subscription",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "courses",
                                    localField: "course",
                                    foreignField: "_id",
                                    as: "course"
                                }
                            }
                        ]
                    }
                }
            ]
        )

        if(!payments){
            throw new ApiError(404, "Pending payments not found");
        }

        return NextResponse.json({ message: "Pending payments found successfully", payments }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}