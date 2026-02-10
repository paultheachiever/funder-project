import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("{mongodb connected");
    } catch (error) {
        console.error("failed connection", error.message);
        process.exit(1);
    }
};

export default connectDB;
