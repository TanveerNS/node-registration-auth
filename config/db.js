const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);

        if (err.name === "MongoNetworkError") {
            console.error("Network Error: Please check your internet connection or MongoDB server.");
        } else if (err.name === "MongooseServerSelectionError") {
            console.error("Server Selection Error: Unable to connect to the MongoDB server.");
        } else if (err.name === "MongoParseError") {
            console.error("Parsing Error: Invalid MongoDB URI.");
        }

        process.exit(1);
    }
};

module.exports = connectDB;
