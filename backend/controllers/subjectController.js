// controllers/subjectController.js
import Subject from "../models/subjectModel.js";

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
export const createSubject = async (req, res) => {
  try {
    const { name, code, teacher } = req.body;


    if (!name || !teacher) {
      return res.status(400).json({ message: 'Name and teacher are required' });
    }
    // Check if subject already exists
    const subjectExists = await Subject.findOne({ name });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await Subject.create({
      name,
      code,
      teacher
    });

    res.status(201).json({
      _id: subject._id,
      name: subject.name,
      code: subject.code,
      teacher: subject.teacher,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error while creating subject' });
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getAllSubjects = async (req, res) => {
  try {

  const subjects = await Subject.find()

    res.status(200).json({
      count: subjects.length,
      subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId)
      

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error while fetching subject' });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
export const updateSubject = async (req, res) => {
  try {
    const { name, code, teacher } = req.body;

    const subject = await Subject.findById(req.params.subjectId);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== subject.name) {
      const subjectExists = await Subject.findOne({ name });
      if (subjectExists) {
        return res.status(400).json({ message: 'Subject with this name already exists' });
      }
      subject.name = name;
    }

    if (code) subject.code = code;
    if (teacher) subject.teacher = teacher;

    const updatedSubject = await subject.save();

    res.status(200).json({
      _id: updatedSubject._id,
      name: updatedSubject.name,
      code: updatedSubject.code,
      teacher: updatedSubject.teacher,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error while updating subject' });
  }
};


export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.subjectId); // ✅ fixed line

    res.status(200).json({ message: 'Subject removed successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error while deleting subject' });
  }
};
