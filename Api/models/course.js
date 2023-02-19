

import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true, 
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: {},
      minlength: 200,
    },
    video: {},
    lessontotaltime: {
      type: Number,
      default: 0,
      
    },
    
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: {},
      minlength: 100,
      required: true,
    },
    whoisthiscoursefor: {
      type: {},
      minlength: 100,
      required: true,
    },
    price: {
      type: {},
      default: 9.99,
    },
    maxstudents: {
      type: {},
      default: 0,
      
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    enrolledstudents: {
      type: Number,
      default: 0,
      
    },
    coursetotaltime: {
      type: Number,
      default: 0,
      
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    lessons: [lessonSchema],
  },
  { timestamps: true } 
);

export default mongoose.model("Course", courseSchema);
