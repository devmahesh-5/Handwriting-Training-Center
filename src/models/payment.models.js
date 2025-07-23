import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
     paymentGateway: {
        type: String
    },
    transaction_uuid: {
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
