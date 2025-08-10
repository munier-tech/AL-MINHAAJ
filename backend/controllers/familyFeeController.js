import FamilyFee from "../models/familyFeeModel.js";
import Student from "../models/studentsModel.js";
import Finance from "../models/financeModel.js";

// Create a new family fee record
export const createFamilyFee = async (req, res) => {
  try {
    const { familyName, students, totalAmount, month, year, dueDate, note } = req.body;
    const userId = req.user.id;

    // Validate that all students exist
    const studentIds = students.map(s => s.student);
    const existingStudents = await Student.find({ _id: { $in: studentIds } });
    
    if (existingStudents.length !== studentIds.length) {
      return res.status(400).json({ message: "One or more students not found" });
    }

    // Check if family fee already exists for this month/year
    const existingFamilyFee = await FamilyFee.findOne({
      familyName,
      month,
      year
    });

    if (existingFamilyFee) {
      return res.status(400).json({ 
        message: "Family fee record already exists for this month and year" 
      });
    }

    const familyFee = new FamilyFee({
      familyName,
      students,
      totalAmount,
      month,
      year,
      dueDate: new Date(dueDate),
      note,
      createdBy: userId
    });

    await familyFee.save();
    await familyFee.populate('students.student', 'firstName lastName studentId class');

    res.status(201).json({
      message: "Family fee record created successfully",
      familyFee
    });
  } catch (error) {
    console.error("Error creating family fee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all family fee records
export const getAllFamilyFees = async (req, res) => {
  try {
    const { month, year, paid, familyName } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (paid !== undefined) filter.paid = paid === 'true';
    if (familyName) filter.familyName = { $regex: familyName, $options: 'i' };

    const familyFees = await FamilyFee.find(filter)
      .populate('students.student', 'firstName lastName studentId class')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Family fees retrieved successfully",
      familyFees,
      total: familyFees.length
    });
  } catch (error) {
    console.error("Error fetching family fees:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get family fee by ID
export const getFamilyFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const familyFee = await FamilyFee.findById(id)
      .populate('students.student', 'firstName lastName studentId class')
      .populate('createdBy', 'firstName lastName');

    if (!familyFee) {
      return res.status(404).json({ message: "Family fee record not found" });
    }

    res.status(200).json({
      message: "Family fee retrieved successfully",
      familyFee
    });
  } catch (error) {
    console.error("Error fetching family fee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update family fee record
export const updateFamilyFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const familyFee = await FamilyFee.findById(id);
    if (!familyFee) {
      return res.status(404).json({ message: "Family fee record not found" });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        familyFee[key] = updates[key];
      }
    });

    await familyFee.save();
    await familyFee.populate('students.student', 'firstName lastName studentId class');

    res.status(200).json({
      message: "Family fee updated successfully",
      familyFee
    });
  } catch (error) {
    console.error("Error updating family fee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Process family fee payment
export const processFamilyFeePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod, note } = req.body;

    const familyFee = await FamilyFee.findById(id)
      .populate('students.student', 'firstName lastName studentId class');

    if (!familyFee) {
      return res.status(404).json({ message: "Family fee record not found" });
    }

    // Update payment details
    familyFee.paidAmount = paidAmount;
    familyFee.paid = paidAmount >= familyFee.totalAmount;
    familyFee.paidDate = new Date();
    familyFee.paymentMethod = paymentMethod || 'cash';
    if (note) familyFee.note = note;

    await familyFee.save();

    // Add to finance if fully paid
    if (familyFee.paid) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      // Check if finance record exists for this month/year
      let financeRecord = await Finance.findOne({
        month: familyFee.month,
        year: familyFee.year
      });

      if (!financeRecord) {
        financeRecord = new Finance({
          month: familyFee.month,
          year: familyFee.year,
          monthName: monthNames[familyFee.month - 1],
          income: 0,
          expenses: 0,
          paidFeesCount: 0,
          unpaidFeesCount: 0,
          createdBy: req.user.id
        });
      }

      // Add family fee to income
      financeRecord.income += familyFee.paidAmount;
      financeRecord.paidFeesCount += familyFee.students.length; // Count all family members as paid

      await financeRecord.save();
    }

    res.status(200).json({
      message: "Family fee payment processed successfully",
      familyFee
    });
  } catch (error) {
    console.error("Error processing family fee payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete family fee record
export const deleteFamilyFee = async (req, res) => {
  try {
    const { id } = req.params;

    const familyFee = await FamilyFee.findById(id);
    if (!familyFee) {
      return res.status(404).json({ message: "Family fee record not found" });
    }

    // If it was paid, remove from finance
    if (familyFee.paid) {
      const financeRecord = await Finance.findOne({
        month: familyFee.month,
        year: familyFee.year
      });

      if (financeRecord) {
        financeRecord.income -= familyFee.paidAmount;
        financeRecord.paidFeesCount -= familyFee.students.length;
        await financeRecord.save();
      }
    }

    await FamilyFee.findByIdAndDelete(id);

    res.status(200).json({
      message: "Family fee record deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting family fee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get family fee statistics
export const getFamilyFeeStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const totalFamilies = await FamilyFee.countDocuments(filter);
    const paidFamilies = await FamilyFee.countDocuments({ ...filter, paid: true });
    const unpaidFamilies = totalFamilies - paidFamilies;

    const totalAmountResult = await FamilyFee.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const paidAmountResult = await FamilyFee.aggregate([
      { $match: { ...filter, paid: true } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    ]);

    const totalAmount = totalAmountResult[0]?.total || 0;
    const paidAmount = paidAmountResult[0]?.total || 0;

    // Count total students in families
    const studentCountResult = await FamilyFee.aggregate([
      { $match: filter },
      { $unwind: "$students" },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const totalStudentsInFamilies = studentCountResult[0]?.count || 0;

    res.status(200).json({
      message: "Family fee statistics retrieved successfully",
      statistics: {
        totalFamilies,
        paidFamilies,
        unpaidFamilies,
        totalAmount,
        paidAmount,
        unpaidAmount: totalAmount - paidAmount,
        totalStudentsInFamilies,
        paymentRate: totalFamilies > 0 ? ((paidFamilies / totalFamilies) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching family fee statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};