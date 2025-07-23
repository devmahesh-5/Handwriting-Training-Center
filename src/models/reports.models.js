import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    report: {
        type: String,
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "resolved"],
        default: "pending",
    },
},{timestamps : true});

reportSchema.index({ student: 1, teacher: 1 }, { background: true });
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report