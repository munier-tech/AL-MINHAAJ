import express from "express";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  assignStudentToClass,
  trackFeePayment,
  getFeeStatus,
  updateFeeInfo,
  deleteFeeInfo,
  getStudentsByClass
} from "../controllers/studentsController.js";
import { protectedRoute } from "../middlewares/authorization.js";

const router = express.Router();

// Core student routes
router.post("/create", protectedRoute ,  createStudent);
router.get("/getAll", protectedRoute ,  getAllStudents);
router.get("/getId/:studentId", protectedRoute ,  getStudentById);
router.put("/update/:studentId", protectedRoute ,  updateStudent);
router.delete("/delete/:studentId", protectedRoute ,  deleteStudent);
router.get('/class/:classId', getStudentsByClass);


// Class assignment
router.post("/:studentId/:classId", protectedRoute ,  assignStudentToClass);

// Fee management (🟡 made consistent by placing studentId at end)
router.patch("/track-fee/:studentId", protectedRoute ,  trackFeePayment);      
router.get("/fee-status/:studentId", protectedRoute ,  getFeeStatus);          
router.patch("/update-fee/:studentId", protectedRoute ,  updateFeeInfo);       
router.delete("/reset-fee/:studentId", protectedRoute ,  deleteFeeInfo);       

export default router;
