import mongoose from "mongoose";
import { NextResponse} from "next/server";
import type { NextRequest } from "next/server";
import Payment from "@/models/payment.models";
import connectDB from "@/db/index";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import User from "@/models/users.models";


connectDB();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { _id: userId } = await getDataFromToken(req);

        const { id } = await params;

        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not found");
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(404, "invalid payment id");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "user not found");
        }

        if (user.role !== "admin") {
            throw new ApiError(403, "unauthorized access");
        }

        const respondedPayment = await Payment.findByIdAndUpdate(
            id,
             { 
                $set: {
                    status: "paid"
                }
             },
            { new: true }
        );

        if (!respondedPayment) {
            throw new ApiError(404, "payment not found");
        }

        return NextResponse.json({ message: "payment updated successfully" }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({
            message:"error updating payment",
            }, { status: 500

             });
    
        
    }

}