import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentProof: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        required: true,
        default: 'Pending',
    },
     paymentGateway: {
        type: String
    },
    subscription : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Subscription'
    }
}, {
    timestamps: true
});

paymentSchema.index({ student: 1, Classroom: 1 }, { background: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment
