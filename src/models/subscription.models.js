import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
        required: true,
    },
    paymentGateway: {
        type: String
    },
   
}, {
    timestamps: true
});

subscriptionSchema.index({ student: 1, classroom: 1 }, { background: true });

const Subscription =  mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription