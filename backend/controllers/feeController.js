import Fee from "../models/feeModel.js";
import Student from "../models/studentsModel.js";
import Class from "../models/classModel.js";

// Create fee record for a student
export const createFeeRecord = async (req, res) => {
  try {
    const { student, amount, month, year, dueDate, note } = req.body;

    if (!student || !amount || !month || !year || !dueDate) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    // Check if student exists and get their class
    const existingStudent = await Student.findById(student).populate('class');
    if (!existingStudent) {
      return res.status(404).json({ message: "Ardayga lama helin" });
    }

    if (!existingStudent.class) {
      return res.status(400).json({ message: "Ardaygan fasalka lama geeyey" });
    }

    // Check if fee record already exists for this student, month, and year
    const existingFee = await Fee.findOne({ student, month, year });
    if (existingFee) {
      return res.status(400).json({ message: "Lacagta bishan ardaygan horay ayaa loo abuuray" });
    }

    const feeRecord = new Fee({
      student,
      class: existingStudent.class._id,
      amount,
      month,
      year,
      dueDate: new Date(dueDate),
      note: note || "",
      createdBy: req.user.id
    });

    await feeRecord.save();

    // Populate the created record for response
    await feeRecord.populate(['student', 'class', 'createdBy']);

    return res.status(201).json({ 
      message: "Diiwaanka lacagta si guul leh ayaa loo abuuray", 
      feeRecord 
    });

  } catch (error) {
    console.error("Error creating fee record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka lacagta abuurista" });
  }
};

// Create fees for all students in a class
export const createClassFees = async (req, res) => {
  try {
    const { classId, amount, month, year, dueDate, note } = req.body;

    if (!classId || !amount || !month || !year || !dueDate) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    // Check if class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    // Get all students in the class
    const students = await Student.find({ class: classId });
    if (students.length === 0) {
      return res.status(400).json({ message: "Fasalkan ardayga kuma jiraan" });
    }

    const feeRecords = [];
    const existingFees = [];

    for (const student of students) {
      // Check if fee already exists for this student
      const existingFee = await Fee.findOne({ 
        student: student._id, 
        month, 
        year 
      });

      if (existingFee) {
        existingFees.push(student.fullname);
        continue;
      }

      const feeRecord = new Fee({
        student: student._id,
        class: classId,
        amount,
        month,
        year,
        dueDate: new Date(dueDate),
        note: note || "",
        createdBy: req.user.id
      });

      await feeRecord.save();
      feeRecords.push(feeRecord);
    }

    let message = `${feeRecords.length} diiwaanka lacagta si guul leh ayaa loo abuuray`;
    if (existingFees.length > 0) {
      message += `. ${existingFees.length} ardayga horay ayaa lacagtooda la abuuray: ${existingFees.join(', ')}`;
    }

    return res.status(201).json({ 
      message, 
      created: feeRecords.length,
      existing: existingFees.length,
      feeRecords 
    });

  } catch (error) {
    console.error("Error creating class fees:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay lacagta fasalka abuurista" });
  }
};

// Get students by class for fee management
export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "Fadlan dooro fasalka" });
    }

    // Check if class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Fasalka lama helin" });
    }

    const students = await Student.find({ class: classId })
      .populate('class')
      .sort({ fullname: 1 });

    if (students.length === 0) {
      return res.status(404).json({ message: "Fasalkan ardayga kuma jiraan" });
    }

    // Always get fee records if month and year are provided, or return students without fee records
    let studentsWithFees = await Promise.all(
      students.map(async (student) => {
        let feeRecord = null;
        
        if (month && year) {
          feeRecord = await Fee.findOne({
            student: student._id,
            month: parseInt(month),
            year: parseInt(year)
          });
        }

        return {
          ...student.toObject(),
          feeRecord
        };
      })
    );

    return res.status(200).json({ 
      message: "Ardayda si guul leh ayaa loo helay", 
      students: studentsWithFees 
    });

  } catch (error) {
    console.error("Error getting students by class:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay ardayda soo bandhigista" });
  }
};

// Get all fee records
export const getAllFeeRecords = async (req, res) => {
  try {
    const { month, year, classId, paid } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (classId) filter.class = classId;
    if (paid !== undefined) filter.paid = paid === 'true';

    const feeRecords = await Fee.find(filter)
      .populate('student', 'fullname')
      .populate('class', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      message: "Diiwaanka lacagta si guul leh ayaa loo helay", 
      feeRecords 
    });

  } catch (error) {
    console.error("Error getting fee records:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka lacagta soo bandhigista" });
  }
};

// Get fee records for a specific student
export const getStudentFeeRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year } = req.query;

    let filter = { student: studentId };
    if (year) filter.year = parseInt(year);

    const feeRecords = await Fee.find(filter)
      .populate('student', 'fullname')
      .populate('class', 'name')
      .populate('createdBy', 'username')
      .sort({ year: -1, month: -1 });

    return res.status(200).json({ 
      message: "Diiwaanka lacagta ardayga si guul leh ayaa loo helay", 
      feeRecords 
    });

  } catch (error) {
    console.error("Error getting student fee records:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka lacagta ardayga soo bandhigista" });
  }
};

// Update fee record (mark as paid/unpaid)
export const updateFeeRecord = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { paid, paidDate, note } = req.body;

    const feeRecord = await Fee.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({ message: "Diiwaanka lacagta lama helin" });
    }

    // Update fields
    if (paid !== undefined) {
      feeRecord.paid = paid;
      feeRecord.paidDate = paid ? (paidDate ? new Date(paidDate) : new Date()) : null;
    }
    if (note !== undefined) feeRecord.note = note;

    await feeRecord.save();

    // Populate for response
    await feeRecord.populate(['student', 'class', 'createdBy']);

    return res.status(200).json({ 
      message: "Diiwaanka lacagta si guul leh ayaa loo cusboonaysiiyay", 
      feeRecord 
    });

  } catch (error) {
    console.error("Error updating fee record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka lacagta cusboonaysiinta" });
  }
};

// Delete fee record
export const deleteFeeRecord = async (req, res) => {
  try {
    const { feeId } = req.params;

    const feeRecord = await Fee.findByIdAndDelete(feeId);
    if (!feeRecord) {
      return res.status(404).json({ message: "Diiwaanka lacagta lama helin" });
    }

    return res.status(200).json({ 
      message: "Diiwaanka lacagta si guul leh ayaa loo tirtay" 
    });

  } catch (error) {
    console.error("Error deleting fee record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka lacagta tirista" });
  }
};

// Get fee statistics
export const getFeeStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const totalFees = await Fee.countDocuments(filter);
    const paidFees = await Fee.countDocuments({ ...filter, paid: true });
    const unpaidFees = totalFees - paidFees;
    
    const totalAmount = await Fee.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const paidAmount = await Fee.aggregate([
      { $match: { ...filter, paid: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return res.status(200).json({
      message: "Tirakoobka lacagta si guul leh ayaa loo helay",
      statistics: {
        totalFees,
        paidFees,
        unpaidFees,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        unpaidAmount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0)
      }
    });

  } catch (error) {
    console.error("Error getting fee statistics:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay tirakoobka lacagta soo bandhigista" });
  }
};