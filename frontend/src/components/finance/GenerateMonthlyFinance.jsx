import React, { useState } from 'react';
import { FiRefreshCw, FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import useFinanceStore from '../../store/financeStore';
import {useFeeStore} from '../../store/feeStore';
import {useSalaryStore} from '../../store/salaryStore';


const GenerateMonthlyFinance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatedFinance, setGeneratedFinance] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { 
    generateMonthlyFinance, 
    getFinanceSummary,
    loading: financeLoading 
  } = useFinanceStore();

  const { 
    getAllFeeRecords, 
    loading: feeLoading 
  } = useFeeStore();

  const { 
    getAllSalaryRecords, 
    loading: salaryLoading 
  } = useSalaryStore();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('so-SO', {
      style: 'currency',
      currency: 'SOS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMonthName = (monthNum) => {
    const months = [
      'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'Maajo', 'Juun',
      'Luuliyo', 'Agoosto', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Diseembar'
    ];
    return months[monthNum - 1];
  };

  const handleGenerateFinance = async () => {
    try {
      const result = await generateMonthlyFinance(selectedMonth, selectedYear);
      if (result.success) {
        setGeneratedFinance(result.finance);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating finance:', error);
    }
  };

  const handlePreviewData = async () => {
    try {
      // Get fee records for the selected month
      const feeRecords = await getAllFeeRecords({
        month: selectedMonth,
        year: selectedYear
      });

      // Get salary records for the selected month
      const salaryRecords = await getAllSalaryRecords({
        month: selectedMonth,
        year: selectedYear
      });

      // Calculate totals
      const paidFees = feeRecords.filter(fee => fee.paid);
      const unpaidFees = feeRecords.filter(fee => !fee.paid);
      const paidSalaries = salaryRecords.filter(salary => salary.paid);

      const totalIncome = paidFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalExpenses = paidSalaries.reduce((sum, salary) => sum + salary.totalAmount, 0);
      const totalDebt = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);

      setGeneratedFinance({
        income: totalIncome,
        expenses: totalExpenses,
        debt: totalDebt,
        paidFeesCount: paidFees.length,
        paidSalariesCount: paidSalaries.length,
        unpaidFeesCount: unpaidFees.length,
        month: selectedMonth,
        year: selectedYear
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing data:', error);
    }
  };

  const loading = financeLoading || feeLoading || salaryLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FiRefreshCw className="mr-3 text-blue-600" />
            Si toos ah u abuur maalgelinta bishan
          </h1>
          <p className="text-gray-600 mt-2">
            Tani waxay si toos ah u xisaabin doontaa lacagta ardayda (dakhliga) iyo mushaharka macalimiinta (kharashka) bishan.
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            Dooro bisha iyo sanadka
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bisha</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sanadka</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePreviewData}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FiEye className="mr-2" />
              Eeg Faahfaahinta
            </button>
            <button
              onClick={handleGenerateFinance}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiRefreshCw className="mr-2" />
              )}
              Abuur Maalgelin
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && generatedFinance && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiDollarSign className="mr-2" />
              Faahfaahinta Maalgelinta {getMonthName(generatedFinance.month)} {generatedFinance.year}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Income Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Dakhliga</p>
                    <p className="text-2xl font-bold">{formatCurrency(generatedFinance.income)}</p>
                    <p className="text-green-200 text-xs">Lacagta ardayda</p>
                  </div>
                  <FiTrendingUp className="text-3xl text-green-200" />
                </div>
                <div className="mt-4 text-green-200 text-sm">
                  {generatedFinance.paidFeesCount} arday oo bixiyay
                </div>
              </div>

              {/* Expenses Card */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Kharashka</p>
                    <p className="text-2xl font-bold">{formatCurrency(generatedFinance.expenses)}</p>
                    <p className="text-red-200 text-xs">Mushaharka macalimiinta</p>
                  </div>
                  <FiTrendingDown className="text-3xl text-red-200" />
                </div>
                <div className="mt-4 text-red-200 text-sm">
                  {generatedFinance.paidSalariesCount} macallin oo la bixiyay
                </div>
              </div>

              {/* Debt Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Qaansheega</p>
                    <p className="text-2xl font-bold">{formatCurrency(generatedFinance.debt)}</p>
                    <p className="text-orange-200 text-xs">Lacagta aan la bixin</p>
                  </div>
                  <FiUsers className="text-3xl text-orange-200" />
                </div>
                <div className="mt-4 text-orange-200 text-sm">
                  {generatedFinance.unpaidFeesCount} arday oo aan bixin
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Faahfaahin (Dakhliga - Kharashka)</p>
                <p className={`text-3xl font-bold ${
                  (generatedFinance.income - generatedFinance.expenses) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(generatedFinance.income - generatedFinance.expenses)}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Faahfaahin</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dakhliga: {formatCurrency(generatedFinance.income)} ({generatedFinance.paidFeesCount} arday)</li>
                <li>• Kharashka: {formatCurrency(generatedFinance.expenses)} ({generatedFinance.paidSalariesCount} macallin)</li>
                <li>• Qaansheega: {formatCurrency(generatedFinance.debt)} ({generatedFinance.unpaidFeesCount} arday)</li>
                <li>• Faahfaahin: {formatCurrency(generatedFinance.income - generatedFinance.expenses)}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Sida loo isticmaalo</h3>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">1</div>
              <p>Dooro bisha iyo sanadka aad rabto inaad u abuurto maalgelinta</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">2</div>
              <p>Riix "Eeg Faahfaahinta" si aad u aragto faahfaahinta lacagta ardayda iyo mushaharka macalimiinta</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">3</div>
              <p>Riix "Abuur Maalgelin" si aad u keydisato maalgelinta bishan</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">4</div>
              <p>Maalgelinta waxay si toos ah u xisaabin doontaa lacagta ardayda (dakhliga) iyo mushaharka macalimiinta (kharashka)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateMonthlyFinance;