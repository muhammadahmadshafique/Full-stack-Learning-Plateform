import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// middleware
import { requireSignin, isInstructor,isEnrolled  } from "../middlewares";

// controllers
import { uploadImage, removeImage, create,read, uploadVideo,removeVideo,addLesson,update,removeLesson,updateLesson,publishCourse,unpublishCourse,courses,checkEnrollment,freeEnrollment
  ,paidEnrollment,stripeSuccess,userCourses,markCompleted,listCompleted,markIncomplete,search,deletecourse,markRating,ratingCompleted,


} from "../controllers/course";
router.get("/courses", courses);
// image
router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage); 


 
// router.post("/instructor/student-count", requireSignin, studentCount); 
// course
router.post("/course", requireSignin, isInstructor, create);
router.get("/course/:slug", read);
router.post(
  "/course/video-upload/:instructorId",
  requireSignin,
  formidable(),
  uploadVideo
);
  router.post("/course/video-remove/:instructorId", requireSignin, removeVideo);

  router.put("/course/publish/:courseId", requireSignin, publishCourse);
  router.put("/course/unpublish/:courseId", requireSignin, unpublishCourse); 


  router.post("/course/lesson/:slug/:instructorId", requireSignin, addLesson);
  router.put("/course/:slug", requireSignin, update);
  router.put("/course/:slug/:lessonId", requireSignin, removeLesson);
  router.put("/course/lesson/:slug/:instructorId", requireSignin, updateLesson); 


  router.get("/check-enrollment/:courseId", requireSignin, checkEnrollment);
  // enrollment
  router.post("/free-enrollment/:courseId", requireSignin, freeEnrollment); 


  router.post("/paid-enrollment/:courseId", requireSignin, paidEnrollment);
router.get("/stripe-success/:courseId", requireSignin, stripeSuccess);
  
router.get("/user-courses", requireSignin, userCourses);

router.get("/user/course/:slug", requireSignin, isEnrolled, read);


router.post("/mark-rating", requireSignin, markRating);
router.post("/rating-completed", requireSignin, ratingCompleted);



// mark completed
router.post("/mark-completed", requireSignin, markCompleted);
router.post("/list-completed", requireSignin, listCompleted);
router.post("/mark-incomplete", requireSignin, markIncomplete);
router.get("/search", search);
router.delete("/deletecourse/:courseid", requireSignin, deletecourse);


module.exports = router;
