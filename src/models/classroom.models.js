import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'active'],
        default: 'pending',
        required: true,
    },
    

}, {
    timestamps: true
});

classroomSchema.index({ students: 1 },{ background: true });

const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);
export default Classroom;