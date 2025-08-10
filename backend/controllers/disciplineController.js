import Discipline from "../models/disciplineModel.js";
import Student from "../models/studentsModel.js";

// Create discipline record
export const createDiscipline = async (req, res) => {
  try {
    const { student, date, reason, type } = req.body;

    const newRecord = await Discipline.create({
      student,
      date: new Date(date),
      reason,
      type,
    });

    await newRecord.save();

    await Student.findByIdAndUpdate(
      student,
      { $addToSet: { disciplineReports: newRecord._id } }, // Prevents duplicates
      { new: true }
        );


    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: "Failed to create discipline record", error });
  }
};

// Get all discipline records
export const getAllDisciplineRecords = async (req, res) => {
  try {
    const records = await Discipline.find().populate("student", "fullname studentId");
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch discipline records", error });
  }
};

// Get single discipline record by ID
export const getDisciplineById = async (req, res) => {
  try {
    const record = await Discipline.findById(req.params.id).populate("student", "fullName studentId");

    if (!record) {
      return res.status(404).json({ message: "Discipline record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to get discipline record", error });
  }
};

// Update discipline record
export const updateDiscipline = async (req, res) => {
  try {
    const updated = await Discipline.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Discipline record not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update discipline record", error });
  }
};

// Delete discipline record
export const deleteDiscipline = async (req, res) => {
  try {
    const deleted = await Discipline.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Discipline record not found" });
    }

    res.status(200).json({ message: "Discipline record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete discipline record", error });
  }
};


// Get all discipline records for a specific student
export const getStudentDisciplineRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const records = await Discipline.find({ student: studentId })
      .sort({ date: -1 })
      .populate('student', 'fullname class');

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch discipline records", error });
  }
};