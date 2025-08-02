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
    practiceSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticeSet',
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    ],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
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