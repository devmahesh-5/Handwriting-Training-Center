//deleting and updating messages

import Messages from "@/models/message.models";
import connectDB from "@/db/index";
import { NextResponse, NextRequest } from "next/server";
import { saveBuffer } from "@/utils/saveBuffer";
import uploadOnCloudinary from "@/helpers/cloudinary";
import getDataFromToken from "@/helpers/checkAuth";
import mongoose, { isValidObjectId } from "mongoose";


connectDB();

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await getDataFromToken(request);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const deletedMessage = await Messages.findByIdAndDelete(id);
        if (!deletedMessage) {
            return NextResponse.json({ message: "Message coould not be deleted" }, { status: 500 });
        }
        return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({ message: "Error deleting message" }, { status: 500 });
    }
}   

export async function PATCH(request:NextRequest,{params}:{params:{id:string}}) {
    const { id } = params;
    try {

        const user = await getDataFromToken(request);
        if (!user) {
            
            throw new Error("User Session expired or not logged in");
        }
        if(user.isVerified===false){
            throw new Error("User is not verified");
        }

        const body = await request.json();
        const { message } = body;
        const updatedMessage = await Messages.findByIdAndUpdate(id, { message }, { new: true });

        if (!message) {
            return NextResponse.
            json({
                 message: "Message coould not be updated" 
                }, { 
                    status: 500 
                });
        }

        return NextResponse.
        json({
             message: "Message updated successfully",
              updatedMessage 
            }, {
                 status: 200 
                });
}catch(error:any){
    console.error("Error updating message:", error);
    return NextResponse.json({ message: error.message || "Error updating message" }, { status: 500 });
}

}