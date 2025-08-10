import Attendance from "../models/attendanceModel.js";
import Class from "../models/classModel.js";
import Student from "../models/studentsModel.js";

// ✅ Abuur fasal cusub
export const createClass = async (req, res) => {
  try {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ message: "Fadlan geli magaca fasalka iyo heerka" });
    }

    const existing = await Class.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Fasalka hore ayuu u diiwaangashanaa" });
    }

    const newClass = new Class({ name, level });
    await newClass.save();

    res.status(201).json({ message: "Fasal si guul leh ayaa loo abuuray", classData: newClass });
  } catch (error) {
    console.error("createClass error:", error);
    res.status(500).json({ message:  error.message });
  }
};

// ✅ Soo hel dhammaan fasalada
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("students attendance");
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Soo hel fasal ID-ga
export const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId).populate("students");

    if (!classData) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    res.status(200).json({ classData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cusbooneysii fasal
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, level } = req.body;

    const updated = await Class.findByIdAndUpdate(
      classId,
      { name, level },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    res.status(200).json({ message: "Fasalka si guul leh ayaa loo cusbooneysiiyay", classData: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Tirtir fasal
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const deleted = await Class.findByIdAndDelete(classId);
    if (!deleted) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    res.status(200).json({ message: "Fasalka si guul leh ayaa loo tirtiray" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ U qoondee arday fasal
export const assignStudentToClass = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    const foundClass = await Class.findById(classId);
    const student = await Student.findById(studentId);

    if (!foundClass || !student) {
      return res.status(404).json({ message: "Fasalka ama ardayga lama helin" });
    }

    if (foundClass.students.some(id => id.toString() === studentId)) {
      return res.status(400).json({ message: "Ardayga horey ayaa fasalka loogu daray" });
    }

    foundClass.students.push(studentId);
    await foundClass.save();

    student.class = classId;
    await student.save();

    res.status(200).json({ message: "Ardayga si guul leh ayaa fasalka loogu daray" });
  } catch (error) {
    console.error("Error assigning student:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Ka saar arday fasalka
export const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const foundClass = await Class.findById(classId);
    const foundStudent = await Student.findById(studentId);

    if (!foundClass || !foundStudent) {
      return res.status(404).json({ message: "Fasalka ama ardayga lama helin" });
    }

    await foundClass.students.pull(studentId);
    await foundClass.save();

    foundStudent.class = null;

    res.status(200).json({ message: "Ardayga si guul leh ayaa laga saaray fasalka" });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Soo hel xaadiris fasal
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;

    const foundClass = await Class.findById(classId).populate({
      path: "attendance",
      populate: {
        path: "students.student",
        model: "Student",
        select: "fullname age gender"
      }
    });

    if (!foundClass) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    res.status(200).json({
      message: "Xaadiriska fasalka si guul leh ayaa loo helay",
      attendance: foundClass.attendance,
    });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Soo hel ardayda fasalka
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId).populate({
      path: "students",
      select: "fullname age gender"
    });

    if (!classData) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    res.status(200).json({ students: classData.students });
  } catch (error) {
    console.error("Error fetching class students:", error);
    res.status(500).json({ message: error.message });
  }
};
