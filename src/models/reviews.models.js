import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classroom",
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    practice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Practice",
        required: true,
    },
},{timestamps : true});
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review