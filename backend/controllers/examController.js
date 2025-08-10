// controllers/examController.js
import mongoose from "mongoose";
import Class from "../models/classModel.js";
import Exam from "../models/examModel.js";
import Student from "../models/studentsModel.js";
import Subject from "../models/subjectModel.js";

// Utility to calculate academic year based on date
function getAcademicYear(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = Jan, 11 = Dec
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// Create single exam for one student

// Create a new exam record

export const createExam = async (req, res) => {
  try {
    const {
      student,
      class: classRef,
      teacher,
      subjectId,
      examType,
      date,
      obtainedMarks,
      totalMarks,
      academicYear // optional
    } = req.body;

    if (!student || !classRef || !teacher || !subjectId || !examType || !date ||
      obtainedMarks === undefined || totalMarks === undefined) {
      return res.status(400).json({ message: "All fields except academic year are required" });
    }

    if (obtainedMarks < 0) {
      return res.status(400).json({ message: "Obtained marks cannot be negative" });
    }

    if (totalMarks < 1) {
      return res.status(400).json({ message: "Total marks must be at least 1" });
    }

    if (obtainedMarks > totalMarks) {
      return res.status(400).json({ message: "Obtained marks cannot exceed total marks" });
    }

    const examDate = new Date(date);
    if (examDate > new Date()) {
      return res.status(400).json({ message: "Exam date cannot be in the future" });
    }

    const finalAcademicYear = academicYear || getAcademicYear(examDate);

    if (academicYear) {
      const academicYearRegex = /^\d{4}\/\d{4}$/;
      if (!academicYearRegex.test(academicYear)) {
        return res.status(400).json({ message: "Academic year must be in the format YYYY/YYYY" });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(classRef) ||
      !mongoose.Types.ObjectId.isValid(teacher) ||
      !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const newExam = new Exam({
      student,
      class: classRef,
      teacher,
      subjectId,
      examType,
      date: examDate,
      obtainedMarks,
      totalMarks,
      academicYear: finalAcademicYear
    });

    const savedExam = await newExam.save();

    // ✅ Update student's examRecords
    await Student.findByIdAndUpdate(
      student,
      { $addToSet: { examRecords: savedExam._id } }, // Prevents duplicates
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Exam record created successfully",
      data: savedExam
    });

  } catch (error) {
    console.error("Error creating exam:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate exam record (student, subject, examType, and academic year combination already exists)"
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};





export const createClassExam = async (req, res) => {
  try {
    const { examType, date, classId, subjectId, totalMarks, marksList } = req.body;

    if (!examType || !date || !classId || !subjectId || !totalMarks || !Array.isArray(marksList)) {
      return res.status(400).json({ 
        message: "All fields are required (examType, date, classId, subjectId, totalMarks, marksList)" 
      });
    }

    if (marksList.some(mark => !mark.studentId || mark.obtainedMarks === undefined)) {
      return res.status(400).json({ 
        message: "Each item in marksList must contain studentId and obtainedMarks" 
      });
    }

    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const foundSubject = await Subject.findById(subjectId);
    if (!foundSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const studentIds = marksList.map(item => item.studentId);
    const validStudents = await Student.find({ 
      _id: { $in: studentIds }, 
      class: classId 
    });

    if (validStudents.length !== marksList.length) {
      return res.status(400).json({ 
        message: "Some students not found or don't belong to this class" 
      });
    }

    const academicYear = getAcademicYear(date);
    const examsToCreate = marksList.map(({ studentId, obtainedMarks }) => ({
      student: studentId,
      class: classId,
      teacher: req.user._id,
      subjectId,
      examType,
      date,
      totalMarks: Number(totalMarks),
      obtainedMarks: Number(obtainedMarks),
      academicYear
    }));

    const createdExams = await Exam.insertMany(examsToCreate);

    // ✅ Add exam._id to each student's examRecords
    const examUpdateOperations = createdExams.map(exam => {
      return Student.findByIdAndUpdate(
        exam.student,
        { $addToSet: { examRecords: exam._id } }, // prevent duplicates
        { new: true }
      );
    });

    await Promise.all(examUpdateOperations); // wait for all updates

    res.status(201).json({
      success: true,
      message: "Class exams created successfully",
      examsCount: createdExams.length,
      data: createdExams
    });

  } catch (error) {
    console.error("Error in createClassExam:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
};




// Get Student Exams
export const getStudentExamsByYear = async (req, res) => {
  try {
    // Extract studentId and academicYear from query parameters.
    // Query parameters are used for filtering data.
    const { studentId, academicYear } = req.body;

    // --- Input Validation ---
    // Check if the required fields are present.
    if (!studentId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Student ID and academic year are required query parameters."
      });
    }

    // Validate the academic year format using the same regex.
    const academicYearRegex = /^\d{4}\/\d{4}$/;
    if (!academicYearRegex.test(academicYear)) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be in the format YYYY/YYYY."
      });
    }

    // Validate the Mongoose ObjectId format for the student ID.
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format."
      });
    }

    // --- Database Query ---
    // Find all exams that match the student and academic year.
    // The .populate() method is used to replace the referenced IDs
    // with the actual document data for better context.
    const studentExams = await Exam.find({
      student: studentId,
      academicYear: academicYear
    })
      .populate('student', 'name email')
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .populate('subjectId', 'name');

    // --- Response Handling ---
    // If no exams are found, return a success message with an empty array.
    if (!studentExams || studentExams.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No exam records found for academic year ${academicYear}.`,
        data: []
      });
    }

    // If exams are found, return them.
    res.status(200).json({
      success: true,
      message: "Exam records retrieved successfully.",
      data: studentExams
    });

  } catch (error) {
    // --- Error Handling ---
    console.error("Error retrieving student exams:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};


// Get Exams by Class and Academic Year
export const getExamsByClassAndYear = async (req, res) => {
  try {
    const { classId, academicYear, examType, subjectId } = req.body;

    // Validate input
    if (!classId || !academicYear || !examType || !subjectId) {
      return res.status(400).json({
        message: "classId, academicYear, examType, and subjectId are required",
      });
    }

    // Check if any exams exist for this class
    const classHasExams = await Exam.exists({ class: classId });
    if (!classHasExams) {
      return res.status(404).json({
        message: "This class has no recorded exams.",
      });
    }

    // Fetch exams with all filters applied
    const exams = await Exam.find({
      class: classId,
      academicYear,
      examType,
      subjectId,
    })
      .populate("student", "fullname")
      .populate("subjectId", "name")
      .sort({ date: -1 });

    if (!exams || exams.length === 0) {
      return res.status(404).json({
        message: "No exams found for this combination.",
      });
    }

    res.status(200).json({ exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update Exam
export const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { subjectId, obtainedMarks, totalMarks, date, examType } = req.body;

    if (examType && !["mid-term", "final", "quiz", "assignment"].includes(examType)) {
      return res.status(400).json({
        message: "Invalid exam type. Must be mid-term, final, quiz, or assignment"
      });
    }

    let updateData = {};
    if (subjectId) updateData.subjectId = subjectId;
    if (obtainedMarks !== undefined) updateData.obtainedMarks = obtainedMarks;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (examType) updateData.examType = examType;
    if (date) {
      const parsedDate = new Date(date);
      updateData.date = parsedDate;
      updateData.academicYear = getAcademicYear(parsedDate);
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true }
    ).populate("student", "fullname");

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam updated successfully", exam: updatedExam });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Exam
export const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: error.message });
  }
};
