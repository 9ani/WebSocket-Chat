import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://gani:qwerty123456@weatherapi.qd1uz2q.mongodb.net/backend-homework-1?retryWrites=true&w=majority");
        console.log('MongoDB connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
