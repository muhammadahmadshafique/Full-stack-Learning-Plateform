import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const completedratingSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    course: {
      type: ObjectId,
      ref: "Course",
    },
    rating: {
        type: {},
        
      },
  },
  { timestamps: true }
);

export default mongoose.model("Rating", completedratingSchema);
