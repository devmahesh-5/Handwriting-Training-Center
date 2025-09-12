//user log in and token generated with db data userid and sessionid 
//then a function check for decoded token and if its session id and user db session id is same then return true else false
//and if the user again logs in session id will be updated in db and token will be updated with new session id now older session id is not valid now

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from "next/server";
import connectDB from "@/db/index";
import User from "@/models/users.models";
import { ApiError } from "@/utils/ApiError";
connectDB();

export default async function getDataFromToken(request: NextRequest) {

    try {
        const accessToken = request.cookies.get("accessToken")?.value || "";

    if (!accessToken) {
        throw new ApiError(401, "User Session expired or not logged in");
    }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload & {
            id: string;
            sessionId: string;
        };

        const user = await User.findById(decodedToken.id).select("-password -__v");
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.sessionId != decodedToken.sessionId) {
            throw new ApiError(401, "Session not found");
        }

        if (user) {
            return user;
        }
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while checking authentication");
    }
}