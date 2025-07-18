import mongoose from "mongoose";
const practiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    instruction: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    video:{
        type:String
    }

    
},{timestamps : true});
const Practice = mongoose.models.Practice || mongoose.model('Practice', practiceSchema);
export default Practice