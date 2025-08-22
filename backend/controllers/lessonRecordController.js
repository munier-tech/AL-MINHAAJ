import LessonRecord from "../models/lessonRecordModel.js";
import Halaqa from "../models/halaqaModel.js";

export const createQuranRecord = async (req, res) => {
  try {
    const { halaqaId, dailyLessonHint, currentSurah, taxdiid, studentStatus, notes, studentPerformances } = req.body;

    const halaqa = await Halaqa.findById(halaqaId);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    const record = await LessonRecord.create({
      type: "quran",
      halaqa: halaqaId,
      quran: {
        dailyLessonHint,
        currentSurah,
        taxdiid,
        studentStatus,
        notes,
      },
      studentPerformances: studentPerformances || []
    });

    const populated = await record.populate({ path: "halaqa", select: "name" }).populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubciRecord = async (req, res) => {
  try {
    const { halaqaId, startingSurah, taxdiid, notes, studentPerformances } = req.body;

    const halaqa = await Halaqa.findById(halaqaId);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    const record = await LessonRecord.create({
      type: "subci",
      halaqa: halaqaId,
      subci: {
        startingSurah,
        taxdiid,
        notes,
      },
      studentPerformances: studentPerformances || []
    });

    const populated = await record.populate({ path: "halaqa", select: "name" }).populate({ path: "studentPerformances.student", select: "fullname studentId" });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecordsByHalaqa = async (req, res) => {
  try {
    const { halaqaId } = req.params;
    const items = await LessonRecord.find({ halaqa: halaqaId }).sort({ date: -1 }).populate({ path: "halaqa", select: "name" }).populate({ path: "studentPerformances.student", select: "fullname studentId" });
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