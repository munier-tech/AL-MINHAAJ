import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Class",
  },
  fee: {
  total: {
     type: Number,
     default: 0
   },
  paid: { 
    type: Number,
    default: 0
   }
  },
   motherNumber: {
    type: String,
    required: true,
  },
  fatherNumber: {
    type: String,
    required: true,
  },
  healthRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Health",
    },
  ],
  examRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  disciplineReports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discipline",
    },
  ],
  feeRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
    },
  ],
  attendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
