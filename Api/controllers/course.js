import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import Course from "../models/course";
import sllugify from "slugify";
import slugify from "slugify";
const getVideoDuration = require('node-video-duration');

import { readFileSync } from "fs";
import User from "../models/user";
import Completed from "../models/completed";
import Rating from "../models/rating";
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  // console.log(req.body);
  
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image");

    // prepare the image
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "edemybucketuettaxila",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};


export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    // image params
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    // send remove request to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};


export const create = async (req, res) => {
  console.log(req.body.image)
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).send("Title is taken");

    const course = await new Course({
    
      slug: slugify(req.body.name),
      instructor: req.auth._id,
      name: req.body.name,
      description: req.body.description,
      whoisthiscoursefor: req.body.whoisthiscoursefor,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      paid: req.body.paid, 
      maxstudents: req.body.maxstudents,
      

      
    }).save();

    return res.json(course);
    console.log(course);

  } catch (err) {
    console.log(err);
    return  res.status(400).send("Course Creation Failed. Try again ");
  }
};


export const read = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec();
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};



export const uploadVideo = async (req, res) => {
  try {

    if (req.auth._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized");
    }
    const { video } = req.files;
    // console.log(video);
    if (!video) return res.status(400).send("No video");

    // video params
    const params = {
      Bucket: "edemybucketuettaxila",
      Key: `${nanoid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.auth._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized"); 
    }
    const { Bucket, Key } = req.body;
    console.log("VIDEO REMOVE =====> ", req.body);

    // video params
    const params = {
      Bucket,
      Key,
    };

    // upload to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};




export const addLesson = async (req, res) => {

  try {
    
    const { slug, instructorId } = req.params;
    const { title, description, video ,lessontotaltime} = req.body;
    console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",lessontotaltime);
    // console.log("Aaaaaaaaaaaaaaaaaaaaa",video.Location);
 

    if (req.auth._id != instructorId) {
      return res.status(400).send("Unauthorized"); 
      
    }



    const findfirstnewone = await Course.findOne({
      slug
    }).exec();
  
     console.log("newwwwwwwwwwwwonww,",findfirstnewone.coursetotaltime)
  

    
    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, description, video, slug: slugify(title) } },
        coursetotaltime: findfirstnewone.coursetotaltime+lessontotaltime



      },
      { new: true }
    )
      .populate("instructor", "_id name")
      .exec();
      console.log("uppppppppppppppppp,",updated.coursetotaltime)

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add lesson failed");
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    // console.log(slug);
    const course = await Course.findOne({ slug }).exec();
    // console.log("COURSE FOUND => ", course);
    if (req.auth._id != course.instructor) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

export const removeLesson = async (req, res) => {
  const { slug, lessonId } = req.params;
  const course = await Course.findOne({ slug }).exec();
  if (req.auth._id != course.instructor) {
    return res.status(400).send("Unauthorized");
  }

  const deletedCourse = await Course.findByIdAndUpdate(course._id, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();

  res.json({ ok: true });
};


export const updateLesson = async (req, res) => {
  try {
    const { slug } = req.params;
    const { _id ,title, content, video, free_preview } = req.body;
    // find post
    const course = await Course.findOne({slug})
      .select("instructor")
      .exec();
    // is owner?
    if (req.auth._id != course.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "lessons._id": _id },
      {
        $set: {
          "lessons.$.title": title,
          "lessons.$.content": content,
          "lessons.$.video": video,
          "lessons.$.free_preview": free_preview, 
        },
      }
    ).exec();
    console.log("updated => ", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Update lesson failed");
  }
};


export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select("instructor")
      .exec();
    // is owner?
    if (req.auth._id != courseFound.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let updated = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    // console.log("course published", course);
    // return;
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Publish course failed");
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select("instructor")
      .exec();
    // is owner?
    if (req.auth._id != courseFound.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let updated = await Course.findByIdAndUpdate(
      courseId,
      { published: false },
      { new: true }
    ).exec();
    // console.log("course unpublished", course);
    // return;
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unpublish course failed");
  }
};


export const courses = async (req, res) => {
  // console.log("all courses");
  const all = await Course.find({ published: true })
    .limit(12)
    // .select("-lessons")
    .populate("instructor", "_id name")
    .exec();
  // console.log("============> ", all);
  res.json(all);
};



export const checkEnrollment = async (req, res) => {   
  const { courseId } = await req.params;
  console.log("courseIdcourseIdcourseIdcourseIdcourseId",courseId)
 
  
  // find courses of the currently logged in user
  const user = await User.findById(req.auth._id).exec();
  // check if course id is found in user courses array
  let ids = [];
  let length = user.courses && user.courses.length;
  for (let i = 0; i < length; i++) {
    ids.push(user.courses[i].toString());  
  }
  
  res.json({
    status: ids.includes(courseId),
    course: await Course.findById(courseId).exec(),  
  }); 
};


export const freeEnrollment = async (req, res) => {
  try {
    // check if course is free or paid
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;

    const result = await User.findByIdAndUpdate(
      req.auth._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec();

    var flag = 1;    // increment by 1 every time
  
     const coursea =  await Course.findOneAndUpdate({
      _id: req.params.courseId
    }, {
      $inc: {
        enrolledstudents: flag
      }
    }).exec()

    console.log("enrolledstudentsenrolledstudents",coursea.enrolledstudents);
    res.json({
      message: "Congratulations! You have successfully enrolled",
      course,
    });
  } catch (err) {
    console.log("free enrollment err", err);
    return res.status(400).send("Enrollment create failed");
  }
};





//paid enrollemment

export const paidEnrollment = async (req, res) => {
  try {
    
    // check if course is free or paid
    const course = await Course.findById(req.params.courseId)
      .populate("instructor")
      .exec();
    if (!course.paid) return;
    // Our fee 30%
    let priceeeee= parseInt(course.price.substring(1))
    const fee = (priceeeee * 30) / 100;
    // create stripe session
    
    
  
  
   console.log(typeof priceeeee)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
     
      
      line_items: [
        {
          name: course.name,   
          amount: Math.round(priceeeee.toFixed(2) * 100),
          currency: "usd", 
          quantity: 1,
        },
      ],
      // charge buyer and transfer remaining balance to seller (after fee)
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      // redirect url after successful payment
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
    console.log("SESSION ID => ", session);

    await User.findByIdAndUpdate(req.auth._id, {
      stripeSession: session,
    }).exec();
    res.send(session.id);
  } catch (err) {
    console.log("PAID ENROLLMENT ERR", err);
    return res.status(400).send(err);
  }
};

export const stripeSuccess = async (req, res) => {
  try {
    // find course
    const course = await Course.findById(req.params.courseId).exec();
    // get user from db to get stripe session id
    const user = await User.findById(req.auth._id).exec();
    // if no stripe session return
    if (!user.stripeSession.id) return res.sendStatus(400);
    // retrieve stripe session
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    console.log("STRIPE SUCCESS", session);
    // if session payment status is paid, push course to user's course []
    if (session.payment_status === "paid") {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id },
        $set: { stripeSession: {} },
      }).exec();
    }

    var flag = 1;    // increment by 1 every time
  
    const coursea =  await Course.findOneAndUpdate({
     _id: req.params.courseId
   }, {
     $inc: {
       enrolledstudents: flag
     }
   }).exec()
    res.json({ success: true, course });
  } catch (err) {
    console.log("STRIPE SUCCESS ERR", err);
    res.json({ success: false });
  }
};





//
export const userCourses = async (req, res) => {
  const user = await User.findById(req.auth._id).exec();
  const courses = await Course.find({ _id: { $in: user.courses } })
    .populate("instructor", "_id name")
    .exec();
  res.json(courses);
};

export const markCompleted = async (req, res) => {
  const { courseId, lessonId } = req.body;
  console.log(courseId, lessonId);
 
  // find if user with that course is already created
  const existing = await Completed.findOne({
    user: req.auth._id,
    course: courseId,
  }).exec();

  if (existing) {
    // update
    const updated = await Completed.findOneAndUpdate(
      {
        user: req.auth._id,
        course: courseId,
      },
      {
        $addToSet: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } else {
    // create
    const created = await new Completed({
      user: req.auth._id,
      course: courseId,
      lessons: lessonId,
    }).save();
    res.json({ ok: true });
  }
};

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.auth._id,
      course: req.body.courseId,
    }).exec();
    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

export const markIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const updated = await Completed.findOneAndUpdate(
      {
        user: req.auth._id, 
        course: courseId,
      },
      {
        $pull: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

 
 

export const search = async (req, res) => {
  const query = req.query.q;
  console.log(query);
  try {
    const videos = await Course.find({
      name: { $regex: query, $options: "i" },
    }).limit(40).populate("instructor", "_id name");
    res.status(200).json(videos);
    console.log("These are searched videos",videos)
  } catch (err) {
    console.log(err);
  }
};


export const deletecourse = async (req, res) => {
  console.log("aaaaaaaaaaaaaaaaaaaaa",req.params.courseid)
  try {
    const user = await User.findById(req.auth._id).exec();
    
    if (!user){
      res.send("You can not delete this course")
    }else{
      const deletedcoourse= await Course.findByIdAndDelete(req.params.courseid);
      res.status(200).json({ ok: true});
      console.log("The video has been deleted.");

    }
   
     
  
  } catch (err) {
    next(err);
  }
};
// export const studentCount = async (req, res) => {
//   console.log("req.body.courseIdreq.body.courseIdreq.body.courseId",req.body.newcourseID)
//   try {
//     const users = await User.find({ courses: req.body.courseId })
//       .select("_id")
//       .exec();
//     res.json(users);
//     console.log("usersusersusersusersusersusersusers",users)
//   } catch (err) {
//     console.log(err);
//   }
// };


export const markRating = async (req, res) => {
  const { courseId, rating } = req.body;
  console.log('This is datttttttttttt',courseId,rating);



  const findfirst = await Course.findOne({
    _id: courseId,
  }).exec();

  console.log("FirstFindddddddddd,",findfirst.ratings,findfirst.numOfReviews)


  const updatedRating = await Course.findOneAndUpdate(
    {
      _id: courseId,
    },
    {
      ratings: findfirst.ratings + rating ,
      numOfReviews: findfirst.numOfReviews + 1 ,
    }
  ).exec();








 
  // find if user with that course is already created
  const existing = await Rating.findOne({
    user: req.auth._id,
    course: courseId,
  }).exec();

  if (existing) {
    // update
    const updated = await Rating.findOneAndUpdate(
      {
        user: req.auth._id, 
        course: courseId,
      },
      {
        $addToSet: { rating: rating },
      }
    ).exec();



   



    res.json({rating:updated.rating, ok: true });
  } else {
    // create
    const created = await new Rating({
      user: req.auth._id,
      course: courseId,
      rating: rating,
    }).save();
    res.json({rating:created.rating, ok: true });
  }
};



export const ratingCompleted = async (req, res) => {
  try {
    const ratinga = await Rating.findOne({
      user: req.auth._id,
      course: req.body.courseId,
    }).exec();
    ratinga && res.json({rating:ratinga});
  } catch (err) {
    console.log(err);
  }
};