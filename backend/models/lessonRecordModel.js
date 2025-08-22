import mongoose from "mongoose";

const studentPerformanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  versesTaken: {
    type: String,
    default: ""
  },
  statusScore: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    default: ""
  }
}, { _id: false });

const lessonRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["quran", "subci"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  halaqa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Halaqa",
    required: true
  },
  quran: {
    dailyLessonHint: { type: String, default: "" },
    currentSurah: { type: String, default: "" },
    taxdiid: { type: String, default: "" },
    studentStatus: { type: String, enum: ["reached", "in_progress", "far_behind"], default: "in_progress" },
    notes: { type: String, default: "" }
  },
  subci: {
    startingSurah: { type: String, default: "" },
    taxdiid: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  studentPerformances: [studentPerformanceSchema]
});

const LessonRecord = mongoose.model("LessonRecord", lessonRecordSchema);
export default LessonRecord;