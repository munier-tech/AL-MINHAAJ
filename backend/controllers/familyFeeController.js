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

    // Enforce limit of 5 students per family
    if (students.length > 5) {
      return res.status(400).json({ message: "A family fee can include at most 5 students" });
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

    const previousPaidAmount = Number(familyFee.paidAmount || 0);
    const totalAmount = Number(familyFee.totalAmount || 0);

    const sanitizedPaidAmount = Math.min(Number(paidAmount || 0), totalAmount);

    const previousRemaining = Math.max(totalAmount - previousPaidAmount, 0);
    const newRemaining = Math.max(totalAmount - sanitizedPaidAmount, 0);

    const deltaIncome = sanitizedPaidAmount - previousPaidAmount; // could be negative if correcting
    const deltaDebt = newRemaining - previousRemaining; // positive = more debt, negative = less debt

    // Update payment details on the family fee
    familyFee.paidAmount = sanitizedPaidAmount;
    familyFee.paid = newRemaining === 0;
    familyFee.paidDate = new Date();
    familyFee.paymentMethod = paymentMethod || 'cash';
    if (note) familyFee.note = note;

    await familyFee.save();

    // Find or create finance record for this month/year
    let financeRecord = await Finance.findOne({
      month: familyFee.month,
      year: familyFee.year
    });

    if (!financeRecord) {
      financeRecord = new Finance({
        date: new Date(familyFee.year, familyFee.month - 1, 1),
        income: Math.max(sanitizedPaidAmount, 0),
        expenses: 0,
        debt: Math.max(newRemaining, 0),
        month: familyFee.month,
        year: familyFee.year,
        isAutoGenerated: false,
        paidFeesCount: 0,
        paidSalariesCount: 0,
        unpaidFeesCount: 0,
        lastUpdated: new Date()
      });
    } else {
      financeRecord.income = Math.max(0, (financeRecord.income || 0) + deltaIncome);
      financeRecord.debt = Math.max(0, (financeRecord.debt || 0) + deltaDebt);
      financeRecord.lastUpdated = new Date();
    }

    // If fully paid now, optionally reflect the number of covered students in paidFeesCount
    if (familyFee.paid) {
      financeRecord.paidFeesCount = (financeRecord.paidFeesCount || 0) + familyFee.students.length;
    }

    await financeRecord.save();

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

    // Adjust finance if needed
    const financeRecord = await Finance.findOne({
      month: familyFee.month,
      year: familyFee.year
    });

    if (financeRecord) {
      // If it was fully paid, remove income and counts
      if (familyFee.paid) {
        financeRecord.income = Math.max(0, (financeRecord.income || 0) - (familyFee.paidAmount || 0));
        financeRecord.paidFeesCount = Math.max(0, (financeRecord.paidFeesCount || 0) - familyFee.students.length);
      } else {
        // If not fully paid, remove the outstanding amount from debt and any partial income
        const remaining = Math.max((familyFee.totalAmount || 0) - (familyFee.paidAmount || 0), 0);
        financeRecord.debt = Math.max(0, (financeRecord.debt || 0) - remaining);
        financeRecord.income = Math.max(0, (financeRecord.income || 0) - (familyFee.paidAmount || 0));
      }
      financeRecord.lastUpdated = new Date();
      await financeRecord.save();
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