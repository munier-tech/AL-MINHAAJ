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
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  halaqa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Halaqa",
  },
  quran: {
    dailyLessonNumber: { type: Number, default: 0 },
    currentSurah: { type: String, default: "" },
    taxdiid: { type: String, default: "" },
    studentStatus: { type: String, enum: ["gaadhay", "dhexda_maraya", "aad_uga_fog"], default: "dhexda_maraya" },
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