import mongoose from "mongoose";

export const ConnectDB = async () =>{
    await mongoose.connect('mongodb+srv://icblog:icblog101@ic-blog.4fn5bqc.mongodb.net/ic-blog');
    console.log("DB Connected");
}