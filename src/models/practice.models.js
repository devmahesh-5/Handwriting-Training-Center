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
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    xp: {
        type: Number,
        required: true,
    },
    video:{
        type:String
    }

    
},{timestamps : true});
const Practice = mongoose.models.Practice || mongoose.model('Practice', practiceSchema);
export default Practice