import { ApiError } from "@/utils/ApiError";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, 
        api_key: process.env.CLOUDINARY_API_KEY!, 
        api_secret: process.env.CLOUDINARY_API_SECRET! // Click 'View API Keys' above to copy your API secret
    });

     const uploadOnCloudinary = async (localFilePath: string) => {
        if (!localFilePath) return null;
        try {
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto',
            });
    
            return uploadResult;
        } catch (error:unknown) {
            throw new ApiError(500, "Error uploading file to Cloudinary");
        } finally {
                fs.unlinkSync(localFilePath);
        }
    };
    


export default uploadOnCloudinary;