import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Payment from "@/models/payment.models";
import connectDB from "@/db/index";
import Subscription from "@/models/subscription.models";
import type { NextRequest } from "next/server";
import getDataFromToken from "@/helpers/checkAuth";
import { isValidObjectId } from "mongoose";
import { ApiError } from "@/utils/ApiError";
import uploadOnCloudinary from "@/helpers/cloudinary";
import { saveBuffer } from "@/utils/saveBuffer";

connectDB();

export async function POST(req: NextRequest, { params }: { params: Promise<{ subscriptionId: string }> }) {
    try {

        const formData = await req.formData();

        const paymentProof = formData.get("paymentProof") as File;

        if (!paymentProof || paymentProof.size === 0) {
            throw new ApiError(400, "paymentProof is required");
        }

        const { _id: userId } = await getDataFromToken(req);

        const { subscriptionId } = await params;

        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "user not found");
        }

        if (!isValidObjectId(subscriptionId)) {
            throw new ApiError(404, "invalid subscription id");
        }

        const tempFilePath = await saveBuffer(paymentProof);

        const paymentProofUrl = await uploadOnCloudinary(tempFilePath);

        if (!paymentProofUrl) {
            throw new ApiError(500, "Failed to upload payment proof");
        }

        const payment = await Payment.create({
            paymentProof: paymentProofUrl?.secure_url,
            subscription: subscriptionId,
            student: userId,
        });

        if (!payment) {
            throw new ApiError(500, "Failed to create payment");
        }

        await Subscription.findByIdAndUpdate(subscriptionId, {
            $set: {
                payment: payment._id
            }
        },
            { new: true }
        );

        return NextResponse.json({
            message: "Payment created successfully",
            payment
        }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ message: "Failed to create payment" }, { status: 500 });

    }
}