import  mongoose from "mongoose";

mongoose.connect("mongodb+srv://adhyanagarwal490:CWxcWehHgNMckjpR@cluster0.gr9am.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

const YourModel = mongoose.model("messages", new mongoose.Schema({}));

YourModel.deleteMany({})
  .then(() => {
    console.log("All documents deleted");
    mongoose.connection.close(); // Close the connection after execution
  })
  .catch(err => console.error(err));