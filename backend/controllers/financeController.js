import Finance from "../models/financeModel.js";
import Fee from "../models/feeModel.js";
import Salary from "../models/salaryModel.js";
import FamilyFee from "../models/familyFeeModel.js";

export const AddFinance = async ( req, res ) => {
  try {

    const { income , expenses , debt  , date } = req.body;

    if (!income || !expenses || !debt || !date) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    


    const finance = new Finance({
      income,
      expenses,
      debt,
      date: date ? new Date(date) : new Date()
    });


    await finance.save();

    return res.status(201).json({ message: "Maalgelinta si guul leh ayaa loo abuuray", finance });
  } catch (error) {
    console.error("error in AddFinance function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

// Auto-generate monthly finance summary
export const generateMonthlyFinance = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Fadlan buuxi bisha iyo sanadka" });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Calculate total student fees (income) for the month
    const studentFeesResult = await Fee.aggregate([
      { 
        $match: { 
          month: monthNum, 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const feeUnpaidResult = await Fee.aggregate([
      { $match: { month: monthNum, year: yearNum, paid: false } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Family fee income (sum of paidAmount, supports partial payments)
    const familyPaidAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    ]);

    // Family fee debt (sum of remaining amounts)
    const familyUnpaidAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $project: { remaining: { $subtract: ["$totalAmount", "$paidAmount"] }, students: 1, paid: 1 } },
      { $group: { _id: null, total: { $sum: { $max: ["$remaining", 0] } } } }
    ]);

    // Count paid/unpaid students from family fees
    const familyPaidStudentsAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum, paid: true } },
      { $project: { num: { $size: "$students" } } },
      { $group: { _id: null, count: { $sum: "$num" } } }
    ]);

    const familyUnpaidStudentsAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $project: { unpaidNum: { $cond: [ { $gt: [ { $subtract: ["$totalAmount", "$paidAmount"] }, 0 ] }, { $size: "$students" }, 0 ] } } },
      { $group: { _id: null, count: { $sum: "$unpaidNum" } } }
    ]);

    const feeIncome = studentFeesResult.length > 0 ? studentFeesResult[0].total : 0;
    const feePaidCount = studentFeesResult.length > 0 ? studentFeesResult[0].count : 0;

    const feeDebt = feeUnpaidResult.length > 0 ? feeUnpaidResult[0].total : 0;
    const feeUnpaidCount = feeUnpaidResult.length > 0 ? feeUnpaidResult[0].count : 0;

    const familyIncome = familyPaidAgg.length > 0 ? familyPaidAgg[0].total : 0;
    const familyDebt = familyUnpaidAgg.length > 0 ? familyUnpaidAgg[0].total : 0;
    const familyPaidStudents = familyPaidStudentsAgg.length > 0 ? familyPaidStudentsAgg[0].count : 0;
    const familyUnpaidStudents = familyUnpaidStudentsAgg.length > 0 ? familyUnpaidStudentsAgg[0].count : 0;

    const totalIncome = feeIncome + familyIncome;
    const paidFeesCount = feePaidCount + familyPaidStudents;

    // Calculate total teacher salaries (expenses) for the month
    const teacherSalariesResult = await Salary.aggregate([
      { 
        $match: { 
          month: monthNum, 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const totalExpenses = teacherSalariesResult.length > 0 ? teacherSalariesResult[0].total : 0;
    const paidSalariesCount = teacherSalariesResult.length > 0 ? teacherSalariesResult[0].count : 0;

    // Total unpaid fees (debt) including family fees
    const totalDebt = feeDebt + familyDebt;
    const unpaidFeesCount = feeUnpaidCount + familyUnpaidStudents;

    // Check if finance record already exists for this month
    const existingFinance = await Finance.findOne({
      month: monthNum,
      year: yearNum
    });

    if (existingFinance) {
      // Update existing record
      existingFinance.income = totalIncome;
      existingFinance.expenses = totalExpenses;
      existingFinance.debt = totalDebt;
      existingFinance.paidFeesCount = paidFeesCount;
      existingFinance.paidSalariesCount = paidSalariesCount;
      existingFinance.unpaidFeesCount = unpaidFeesCount;
      existingFinance.lastUpdated = new Date();
      
      await existingFinance.save();
      
      return res.status(200).json({ 
        message: "Maalgelinta bishan si guul leh ayaa loo cusboonaysiiyay", 
        finance: existingFinance 
      });
    } else {
      // Create new finance record
      const finance = new Finance({
        income: totalIncome,
        expenses: totalExpenses,
        debt: totalDebt,
        month: monthNum,
        year: yearNum,
        paidFeesCount,
        paidSalariesCount,
        unpaidFeesCount,
        date: new Date(yearNum, monthNum - 1, 1),
        isAutoGenerated: true
      });

      await finance.save();

      return res.status(201).json({ 
        message: "Maalgelinta bishan si guul leh ayaa loo abuuray", 
        finance 
      });
    }
  } catch (error) {
    console.error("error in generateMonthlyFinance function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

export const getAllFinance = async ( req, res ) => {
  try {
    const finance = await Finance.find({}).sort({ createdAt: -1 });

    return res.status(200).json({ message: "Maalgelinta si guul leh ayaa loo helay", finance });
  } catch (error) {
    console.error("error in getAllFinance function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

// Get finance summary with detailed breakdown
export const getFinanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Fadlan dooro bisha iyo sanadka" });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Get total student fees for the month (income)
    const studentFeesTotal = await Fee.aggregate([
      { 
        $match: { 
          month: monthNum, 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    // Family fee income
    const familyFeesTotal = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    ]);

    // Get total teacher salaries for the month (expenses)
    const teacherSalariesTotal = await Salary.aggregate([
      { 
        $match: { 
          month: monthNum, 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    // Get unpaid fees (debt)
    const unpaidFeesTotal = await Fee.aggregate([
      { 
        $match: { 
          month: monthNum, 
          year: yearNum, 
          paid: false 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const familyUnpaidTotal = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $project: { remaining: { $subtract: ["$totalAmount", "$paidAmount"] }, students: 1, paid: 1 } },
      { $group: { _id: null, total: { $sum: { $max: ["$remaining", 0] } } } }
    ]);

    const familyPaidStudentsAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum, paid: true } },
      { $project: { num: { $size: "$students" } } },
      { $group: { _id: null, count: { $sum: "$num" } } }
    ]);

    const familyUnpaidStudentsAgg = await FamilyFee.aggregate([
      { $match: { month: monthNum, year: yearNum } },
      { $project: { unpaidNum: { $cond: [ { $gt: [ { $subtract: ["$totalAmount", "$paidAmount"] }, 0 ] }, { $size: "$students" }, 0 ] } } },
      { $group: { _id: null, count: { $sum: "$unpaidNum" } } }
    ]);

    const summary = {
      month: monthNum,
      year: yearNum,
      income: (studentFeesTotal.length > 0 ? studentFeesTotal[0].total : 0) + (familyFeesTotal.length > 0 ? familyFeesTotal[0].total : 0),
      expenses: teacherSalariesTotal.length > 0 ? teacherSalariesTotal[0].total : 0,
      debt: (unpaidFeesTotal.length > 0 ? unpaidFeesTotal[0].total : 0) + (familyUnpaidTotal.length > 0 ? familyUnpaidTotal[0].total : 0),
      paidFeesCount: (studentFeesTotal.length > 0 ? studentFeesTotal[0].count : 0) + (familyPaidStudentsAgg.length > 0 ? familyPaidStudentsAgg[0].count : 0),
      paidSalariesCount: teacherSalariesTotal.length > 0 ? teacherSalariesTotal[0].count : 0,
      unpaidFeesCount: (unpaidFeesTotal.length > 0 ? unpaidFeesTotal[0].count : 0) + (familyUnpaidStudentsAgg.length > 0 ? familyUnpaidStudentsAgg[0].count : 0),
      netProfit: 0 // filled below
    };

    summary.netProfit = summary.income - summary.expenses;

    // Get manual finance records for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    const manualFinance = await Finance.find({
      date: { $gte: startDate, $lte: endDate },
      isAutoGenerated: { $ne: true }
    }).sort({ createdAt: -1 });

    // Get auto-generated finance record for the month
    const autoFinance = await Finance.findOne({
      month: monthNum,
      year: yearNum,
      isAutoGenerated: true
    });

    return res.status(200).json({ 
      message: "Faahfaahinta maalgelinta si guul leh ayaa loo helay", 
      summary: { ...summary, manualFinance, autoFinance }
    });
  } catch (error) {
    console.error("error in getFinanceSummary function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

// Get monthly breakdown for the entire year
export const getYearlyFinanceBreakdown = async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({ message: "Fadlan dooro sanadka" });
    }

    const yearNum = parseInt(year);

    // Get monthly breakdown of student fees
    const monthlyFees = await Fee.aggregate([
      { 
        $match: { 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: "$month", 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Family fee paid amounts per month
    const monthlyFamilyPaid = await FamilyFee.aggregate([
      { $match: { year: yearNum } },
      { $group: { _id: "$month", total: { $sum: "$paidAmount" } } },
      { $sort: { _id: 1 } }
    ]);

    // Get monthly breakdown of teacher salaries
    const monthlySalaries = await Salary.aggregate([
      { 
        $match: { 
          year: yearNum, 
          paid: true 
        } 
      },
      { 
        $group: { 
          _id: "$month", 
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Get monthly breakdown of unpaid fees (students)
    const monthlyUnpaidFees = await Fee.aggregate([
      { 
        $match: { 
          year: yearNum, 
          paid: false 
        } 
      },
      { 
        $group: { 
          _id: "$month", 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Family fee remaining amounts per month
    const monthlyFamilyUnpaid = await FamilyFee.aggregate([
      { $match: { year: yearNum } },
      { $project: { month: 1, remaining: { $subtract: ["$totalAmount", "$paidAmount"] } } },
      { $group: { _id: "$month", total: { $sum: { $max: ["$remaining", 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    // Create monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const feesData = monthlyFees.find(f => f._id === month) || { total: 0, count: 0 };
      const familyPaid = monthlyFamilyPaid.find(f => f._id === month) || { total: 0 };
      const salariesData = monthlySalaries.find(s => s._id === month) || { total: 0, count: 0 };
      const unpaidData = monthlyUnpaidFees.find(u => u._id === month) || { total: 0, count: 0 };
      const familyUnpaid = monthlyFamilyUnpaid.find(u => u._id === month) || { total: 0 };

      const income = feesData.total + familyPaid.total;
      const expenses = salariesData.total;
      const debt = unpaidData.total + familyUnpaid.total;

      monthlyBreakdown.push({
        month,
        income,
        expenses,
        debt,
        paidFeesCount: feesData.count, // Family paid count by students omitted for simplicity here
        paidSalariesCount: salariesData.count,
        unpaidFeesCount: unpaidData.count, // Family unpaid count by students omitted for simplicity here
        netProfit: income - expenses
      });
    }

    return res.status(200).json({ 
      message: "Faahfaahinta maalgelinta sanadka si guul leh ayaa loo helay", 
      yearlyBreakdown: {
        year: yearNum,
        monthlyBreakdown,
        totalIncome: monthlyBreakdown.reduce((sum, m) => sum + m.income, 0),
        totalExpenses: monthlyBreakdown.reduce((sum, m) => sum + m.expenses, 0),
        totalDebt: monthlyBreakdown.reduce((sum, m) => sum + m.debt, 0),
        totalPaidFees: monthlyFees.reduce((sum, f) => sum + f.count, 0),
        totalPaidSalaries: monthlySalaries.reduce((sum, s) => sum + s.count, 0),
        totalUnpaidFees: monthlyUnpaidFees.reduce((sum, u) => sum + u.count, 0)
      }
    });
  } catch (error) {
    console.error("error in getYearlyFinanceBreakdown function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

export const getFinanceById = async ( req, res ) => {
  try {
    const { financeId } = req.params;

    const finance = await Finance.findById(financeId);

    if (!finance) {
      return res.status(404).json({ message: "Maalgelinta lama helin" });
    }

    return res.status(200).json({ message: "Maalgelinta si guul leh ayaa loo helay", finance });
  } catch (error) {
    console.error("error in getFinanceById function: ", error);
    return res.status(500).json({ message: error.message });
  }
}

