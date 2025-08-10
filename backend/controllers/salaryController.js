import Salary from "../models/salaryModel.js";
import Teachers from "../models/teachersModel.js";

// Create salary record for a teacher
export const createSalaryRecord = async (req, res) => {
  try {
    const { teacher, amount, month, year, bonus, deductions, note } = req.body;

    if (!teacher || !amount || !month || !year) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    // Check if teacher exists
    const existingTeacher = await Teachers.findById(teacher);
    if (!existingTeacher) {
      return res.status(404).json({ message: "Macalinka lama helin" });
    }

    // Check if salary record already exists for this teacher, month, and year
    const existingSalary = await Salary.findOne({ teacher, month, year });
    if (existingSalary) {
      return res.status(400).json({ message: "Mushaharka bishan macalinka horay ayaa loo abuuray" });
    }

    // ✅ Calculate totalAmount
    const totalAmount = Number(amount) + Number(bonus || 0) - Number(deductions || 0);

    const salaryRecord = new Salary({
      teacher,
      amount,
      month,
      year,
      bonus: bonus || 0,
      deductions: deductions || 0,
      totalAmount, // ✅ include required field
      note: note || "",
      createdBy: req.user.id
    });

    await salaryRecord.save();

    // Populate the created record for response
    await salaryRecord.populate(["teacher", "createdBy"]);

    return res.status(201).json({
      message: "Diiwaanka mushaharka si guul leh ayaa loo abuuray",
      salaryRecord
    });

  } catch (error) {
    console.error("Error creating salary record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka mushaharka abuurista" });
  }
};


// Create salaries for all teachers
export const createAllTeachersSalaries = async (req, res) => {
  try {
    const { amount, month, year, bonus, deductions, note } = req.body;

    if (!amount || !month || !year) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    // Get all teachers
    const teachers = await Teachers.find({});
    if (teachers.length === 0) {
      return res.status(400).json({ message: "Macalimiin lama helin" });
    }

    const salaryRecords = [];
    const existingSalaries = [];

    for (const teacher of teachers) {
      // Check if salary already exists for this teacher
      const existingSalary = await Salary.findOne({ 
        teacher: teacher._id, 
        month, 
        year 
      });

      if (existingSalary) {
        existingSalaries.push(teacher.name);
        continue;
      }

      const salaryRecord = new Salary({
        teacher: teacher._id,
        amount,
        month,
        year,
        bonus: bonus || 0,
        deductions: deductions || 0,
        note: note || "",
        createdBy: req.user.id
      });

      await salaryRecord.save();
      salaryRecords.push(salaryRecord);
    }

    let message = `${salaryRecords.length} diiwaanka mushaharka si guul leh ayaa loo abuuray`;
    if (existingSalaries.length > 0) {
      message += `. ${existingSalaries.length} macalin horay ayaa mushaharkooda la abuuray: ${existingSalaries.join(', ')}`;
    }

    return res.status(201).json({ 
      message, 
      created: salaryRecords.length,
      existing: existingSalaries.length,
      salaryRecords 
    });

  } catch (error) {
    console.error("Error creating teacher salaries:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay mushaharka macaliminta abuurista" });
  }
};

// Get all salary records
export const getAllSalaryRecords = async (req, res) => {
  try {
    const { month, year, paid } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (paid !== undefined) filter.paid = paid === 'true';

    const salaryRecords = await Salary.find(filter)
      .populate('teacher', 'name email subject')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      message: "Diiwaanka mushaharka si guul leh ayaa loo helay", 
      salaryRecords 
    });

  } catch (error) {
    console.error("Error getting salary records:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka mushaharka soo bandhigista" });
  }
};

// Get salary records for a specific teacher
export const getTeacherSalaryRecords = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { year } = req.query;

    let filter = { teacher: teacherId };
    if (year) filter.year = parseInt(year);

    const salaryRecords = await Salary.find(filter)
      .populate('teacher', 'name email subject')
      .populate('createdBy', 'username')
      .sort({ year: -1, month: -1 });

    return res.status(200).json({ 
      message: "Diiwaanka mushaharka macalinka si guul leh ayaa loo helay", 
      salaryRecords 
    });

  } catch (error) {
    console.error("Error getting teacher salary records:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka mushaharka macalinka soo bandhigista" });
  }
};

// Update salary record (mark as paid/unpaid, update amounts)
export const updateSalaryRecord = async (req, res) => {
  try {
    const { salaryId } = req.params;
    const { amount, bonus, deductions, paid, paidDate, note } = req.body;

    const salaryRecord = await Salary.findById(salaryId);
    if (!salaryRecord) {
      return res.status(404).json({ message: "Diiwaanka mushaharka lama helin" });
    }

    // Update fields
    if (amount !== undefined) salaryRecord.amount = amount;
    if (bonus !== undefined) salaryRecord.bonus = bonus;
    if (deductions !== undefined) salaryRecord.deductions = deductions;
    if (paid !== undefined) {
      salaryRecord.paid = paid;
      salaryRecord.paidDate = paid ? (paidDate ? new Date(paidDate) : new Date()) : null;
    }
    if (note !== undefined) salaryRecord.note = note;

    await salaryRecord.save();

    // Populate for response
    await salaryRecord.populate(['teacher', 'createdBy']);

    return res.status(200).json({ 
      message: "Diiwaanka mushaharka si guul leh ayaa loo cusboonaysiiyay", 
      salaryRecord 
    });

  } catch (error) {
    console.error("Error updating salary record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka mushaharka cusboonaysiinta" });
  }
};

// Delete salary record
export const deleteSalaryRecord = async (req, res) => {
  try {
    const { salaryId } = req.params;

    const salaryRecord = await Salary.findByIdAndDelete(salaryId);
    if (!salaryRecord) {
      return res.status(404).json({ message: "Diiwaanka mushaharka lama helin" });
    }

    return res.status(200).json({ 
      message: "Diiwaanka mushaharka si guul leh ayaa loo tirtay" 
    });

  } catch (error) {
    console.error("Error deleting salary record:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay diiwaanka mushaharka tirista" });
  }
};

// Get salary statistics
export const getSalaryStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const totalSalaries = await Salary.countDocuments(filter);
    const paidSalaries = await Salary.countDocuments({ ...filter, paid: true });
    const unpaidSalaries = totalSalaries - paidSalaries;
    
    const totalAmount = await Salary.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const paidAmount = await Salary.aggregate([
      { $match: { ...filter, paid: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    return res.status(200).json({
      message: "Tirakoobka mushaharka si guul leh ayaa loo helay",
      statistics: {
        totalSalaries,
        paidSalaries,
        unpaidSalaries,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        unpaidAmount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0)
      }
    });

  } catch (error) {
    console.error("Error getting salary statistics:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay tirakoobka mushaharka soo bandhigista" });
  }
};

// Get all teachers for salary management
export const getAllTeachers = async (req, res) => {
  try {
    const { month, year } = req.query;

    const teachers = await Teachers.find({})
      .sort({ name: 1 });

    // If month and year are provided, get salary records
    let teachersWithSalaries = teachers;
    if (month && year) {
      teachersWithSalaries = await Promise.all(
        teachers.map(async (teacher) => {
          const salaryRecord = await Salary.findOne({
            teacher: teacher._id,
            month: parseInt(month),
            year: parseInt(year)
          });

          return {
            ...teacher.toObject(),
            salaryRecord
          };
        })
      );
    }

    return res.status(200).json({ 
      message: "Macaliminta si guul leh ayaa loo helay", 
      teachers: teachersWithSalaries 
    });

  } catch (error) {
    console.error("Error getting teachers:", error);
    return res.status(500).json({ message: "Khalad ayaa dhacay macaliminta soo bandhigista" });
  }
};