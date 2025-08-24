import LessonRecord from "../models/lessonRecordModel.js";
import Halaqa from "../models/halaqaModel.js";
import Class from "../models/classModel.js";

export const createQuranRecord = async (req, res) => {
  try {
    const { classId, dailyLessonHint, currentSurah, taxdiid, studentStatus, notes, studentPerformances } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Fasalka lama helin" });

    const created = await LessonRecord.create({
      type: "quran",
      class: classId,
      quran: {
        dailyLessonHint,
        currentSurah,
        taxdiid,
        studentStatus,
        notes,
      },
      studentPerformances: studentPerformances || []
    });

    const record = await LessonRecord.findById(created._id)
      .populate({ path: "class", select: "name level" })
      .populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubcisRecord = async (req, res) => {
  try {
    const { halaqaId, startingSurah, taxdiid, notes, studentPerformances } = req.body;

    const halaqa = await Halaqa.findById(halaqaId);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    const created = await LessonRecord.create({
      type: "subcis",
      halaqa: halaqaId,
      subci: {
        startingSurah,
        taxdiid,
        notes,
      },
      studentPerformances: studentPerformances || []
    });

    const record = await LessonRecord.findById(created._id)
      .populate({ path: "halaqa", select: "name" })
      .populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { quran, studentPerformances } = req.body;

    const record = await LessonRecord.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (quran && typeof quran === 'object') {
      record.quran = { ...record.quran?.toObject?.() || {}, ...quran };
    }
    if (Array.isArray(studentPerformances)) {
      record.studentPerformances = studentPerformances;
    }

    await record.save();

    const populated = await LessonRecord.findById(record._id)
      .populate({ path: "class", select: "name level" })
      .populate({ path: "halaqa", select: "name" })
      .populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getQuranRecordsByClassAndMonth = async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query; // month: 1-12

    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    const items = await LessonRecord.find({
      type: "quran",
      class: classId,
      date: { $gte: start, $lte: end }
    })
      .sort({ date: -1 })
      .populate({ path: "class", select: "name level" })
      .populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecordsByHalaqa = async (req, res) => {
  try {
    const { halaqaId } = req.params;
    const items = await LessonRecord.find({ halaqa: halaqaId })
      .sort({ date: -1 })
      .populate({ path: "halaqa", select: "name" })
      .populate({ path: "studentPerformances.student", select: "fullname studentId" });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LessonRecord.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};