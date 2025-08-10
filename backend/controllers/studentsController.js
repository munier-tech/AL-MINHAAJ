import Student from "../models/studentsModel.js";

// 1. Abuur Arday
export const createStudent = async (req, res) => {
  try {
    const { fullname, age, gender, classId, motherNumber, fatherNumber } = req.body;

    if (!fullname || !motherNumber || !fatherNumber || !classId) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha looga baahan yahay" });
    }

    if (age < 0) {
      return res.status(400).json({ message: "Da'da waa khaldan tahay" });
    }

    const existedFullname = await Student.findOne({ fullname });
    if (existedFullname) {
      return res.status(400).json({ message: "Arday magacan leh hore ayuu u diiwaangashanaa" });
    }

    const student = new Student({
      fullname,
      age,
      gender,
      class: classId || null,
      motherNumber,
      fatherNumber,
    });

    await student.save();
    res.status(201).json({ message: "Arday si guul leh ayaa loo abuuray", student });
  } catch (error) {
    console.error("Error in createStudent:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Hel Dhammaan Ardayda
export const getAllStudents = async (req , res) => {
  try {
    const student = await Student.find().populate("class")
    res.status(200).json({ students : student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Hel Arday ID
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId)
      .populate({
        path: "examRecords",
        options: { sort: { date: -1 } },
        populate: [
          { 
            path: "subjectId",
            select: "name code teacher"
          },
          { path: "teacher", select: "name" }
        ]
      })
      .populate({
        path: "disciplineReports",
        options: { sort: { date: -1 } }
      })
      .populate("class")
      .populate("healthRecords");

    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    // Log for debugging
    console.log("Student exam records:", JSON.stringify(student.examRecords, null, 2));
    console.log("Student discipline reports:", JSON.stringify(student.disciplineReports, null, 2));

    res.status(200).json({ student });
  } catch (error) {
    console.error("Error in getStudentById:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const students = await Student.find({ class: classId }).populate('class', 'name level');
    
    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching students by class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students for this class",
    });
  }
};


// 4. Cusboonaysii Arday
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fullname, age, gender, classId, motherNumber, fatherNumber } = req.body;

    const updated = await Student.findByIdAndUpdate(
      studentId,
      { fullname, age, gender, class: classId, motherNumber, fatherNumber },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Arday lama helin" });

    res.status(200).json({ message: "Macluumaadka ardayga waa la cusboonaysiiyay", student: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Tirtir Arday
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const deleted = await Student.findByIdAndDelete(studentId);

    if (!deleted) return res.status(404).json({ message: "Arday lama helin" });

    res.status(200).json({ message: "Ardayga si guul leh ayaa loo tirtiray" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. U Qoondee Fasal Ardayga
export const assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.params;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { class: classId },
      { new: true }
    );

    res.status(200).json({ message: "Fasalka ayaa loo qoondeeyay ardayga", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Diiwaangelinta Lacagta Waxbarasho
export const trackFeePayment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total, paid } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Arday lama helin" });
    }

    if (total !== undefined) student.fee.total = total;
    if (paid !== undefined) student.fee.paid += paid;

    await student.save();

    res.status(200).json({ message: "Lacag bixinta waa la diiwaangeliyay", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Hel Xaaladda Lacagta
export const getFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Arday lama helin" });
    }

    const { total, paid } = student.fee;
    const balance = total - paid;

    res.status(200).json({
      feeStatus: {
        total,
        paid,
        balance,
        status: balance === 0 ? "La bixiyay" : balance < 0 ? "Lacag dheeri ah ayaa la bixiyay" : "Lacag harsan"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. Cusboonaysii Xogta Lacagta
export const updateFeeInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { total, paid } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    if (total !== undefined) student.fee.total = total;
    if (paid !== undefined) student.fee.paid = paid;

    await student.save();

    res.status(200).json({ message: "Xogta lacagta waa la cusboonaysiiyay", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 10. Tirtir Xogta Lacagta
export const deleteFeeInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Arday lama helin" });

    student.fee = { total: 0, paid: 0 };

    await student.save();

    res.status(200).json({ message: "Xogta lacagta waa la tiray", fee: student.fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
