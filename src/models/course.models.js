import mongoose from "mongoose";


const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    practiceSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticeSet',
        required: true
    }

}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course
