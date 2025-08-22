import Halaqa from "../models/halaqaModel.js";
import Student from "../models/studentsModel.js";

export const createHalaqa = async (req, res) => {
  try {
    const { name, description, teacher, startingSurah, taxdiid } = req.body;
    const exists = await Halaqa.findOne({ name });
    if (exists) return res.status(400).json({ message: "Halaqa with this name already exists" });

    const halaqa = await Halaqa.create({ name, description, teacher, startingSurah, taxdiid });
    res.status(201).json(halaqa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllHalaqas = async (_req, res) => {
  try {
    const items = await Halaqa.find().populate("teacher", "name").populate("students", "fullname studentId");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHalaqaByName = async (req, res) => {
  try {
    const { name } = req.query;
    const item = await Halaqa.findOne({ name: new RegExp(`^${name}$`, 'i') }).populate("teacher", "name").populate("students", "fullname studentId");
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHalaqaById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Halaqa.findById(id).populate("teacher", "name").populate("students", "fullname studentId");
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const item = await Halaqa.findByIdAndUpdate(id, update, { new: true }).populate("teacher", "name").populate("students", "fullname studentId");
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Halaqa.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Halaqa not found" });
    res.json({ message: "Halaqa deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addStudentsToHalaqa = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // array

    const halaqa = await Halaqa.findById(id);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    // ensure students exist
    const validStudents = await Student.find({ _id: { $in: studentIds } }, "_id");
    const validIds = validStudents.map(s => s._id.toString());

    const set = new Set(halaqa.students.map(s => s.toString()));
    for (const sid of validIds) set.add(sid);
    halaqa.students = Array.from(set);

    await halaqa.save();
    const populated = await halaqa.populate("students", "fullname studentId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeStudentFromHalaqa = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const halaqa = await Halaqa.findById(id);
    if (!halaqa) return res.status(404).json({ message: "Halaqa not found" });

    halaqa.students = halaqa.students.filter(s => s.toString() !== studentId);
    await halaqa.save();

    const populated = await halaqa.populate("students", "fullname studentId");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};