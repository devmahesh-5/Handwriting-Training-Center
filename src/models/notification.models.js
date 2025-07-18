import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiver: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    message: {
        type: String,
        required: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isRead: {
        type: Boolean,
        default: false
    }
},{timestamps : true});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification