import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiCalendar, FiEye, FiRefreshCw } from 'react-icons/fi';
import useFinanceStore from '../../store/financeStore';
import {useFeeStore} from '../../store/feeStore';
import {useSalaryStore} from '../../store/salaryStore';

const FinanceSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { 
    getFinanceSummary,
    getYearlyFinanceBreakdown,
    financeSummary,
    yearlyBreakdown,
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

  const handleGetSummary = async () => {
    setLoading(true);
    try {
      await getFinanceSummary(selectedMonth, selectedYear);
    } catch (error) {
      console.error('Error getting summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetYearlyBreakdown = async () => {
    setLoading(true);
    try {
      await getYearlyFinanceBreakdown(selectedYear);
    } catch (error) {
      console.error('Error getting yearly breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || financeLoading || feeLoading || salaryLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FiDollarSign className="mr-3 text-green-600" />
            Faahfaahinta Maalgelinta
          </h1>
          <p className="text-gray-600 mt-2">
            Eeg faahfaahinta dhammeystiran ee maalgelinta iskuulka - Lacagta ardayda iyo mushaharka macalimiinta
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            Dooro bisha iyo sanadka
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <div className="flex items-end space-x-2">
              <button
                onClick={handleGetSummary}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FiEye className="mr-2" />
                Eeg Bishan
              </button>
              <button
                onClick={handleGetYearlyBreakdown}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FiCalendar className="mr-2" />
                Eeg Sanadka
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        {financeSummary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiDollarSign className="mr-2" />
              Faahfaahinta Maalgelinta {getMonthName(financeSummary.month)} {financeSummary.year}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Income Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Dakhliga</p>
                    <p className="text-2xl font-bold">{formatCurrency(financeSummary.income)}</p>
                    <p className="text-green-200 text-xs">Lacagta ardayda</p>
                  </div>
                  <FiTrendingUp className="text-3xl text-green-200" />
                </div>
                <div className="mt-4 text-green-200 text-sm">
                  {financeSummary.paidFeesCount} arday oo bixiyay
                </div>
              </div>

              {/* Expenses Card */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Kharashka</p>
                    <p className="text-2xl font-bold">{formatCurrency(financeSummary.expenses)}</p>
                    <p className="text-red-200 text-xs">Mushaharka macalimiinta</p>
                  </div>
                  <FiTrendingDown className="text-3xl text-red-200" />
                </div>
                <div className="mt-4 text-red-200 text-sm">
                  {financeSummary.paidSalariesCount} macallin oo la bixiyay
                </div>
              </div>

              {/* Debt Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Qaansheega</p>
                    <p className="text-2xl font-bold">{formatCurrency(financeSummary.debt)}</p>
                    <p className="text-orange-200 text-xs">Lacagta aan la bixin</p>
                  </div>
                  <FiUsers className="text-3xl text-orange-200" />
                </div>
                <div className="mt-4 text-orange-200 text-sm">
                  {financeSummary.unpaidFeesCount} arday oo aan bixin
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Faahfaahin (Dakhliga - Kharashka)</p>
                <p className={`text-3xl font-bold ${
                  financeSummary.netProfit >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(financeSummary.netProfit)}
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Dakhliga (Lacagta Ardayda)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Wadarta lacagta:</span>
                    <span className="font-semibold text-green-800">{formatCurrency(financeSummary.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Tirada ardayda:</span>
                    <span className="font-semibold text-green-800">{financeSummary.paidFeesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Celcelinta:</span>
                    <span className="font-semibold text-green-800">{formatCurrency(financeSummary.income / Math.max(financeSummary.paidFeesCount, 1))}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">Kharashka (Mushaharka Macalimiinta)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-700">Wadarta mushaharka:</span>
                    <span className="font-semibold text-red-800">{formatCurrency(financeSummary.expenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Tirada macalimiinta:</span>
                    <span className="font-semibold text-red-800">{financeSummary.paidSalariesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Celcelinta:</span>
                    <span className="font-semibold text-red-800">{formatCurrency(financeSummary.expenses / Math.max(financeSummary.paidSalariesCount, 1))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yearly Breakdown */}
        {yearlyBreakdown && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Faahfaahinta Maalgelinta Sanadka {yearlyBreakdown.year}
            </h3>
            
            {/* Yearly Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Wadarta Dakhliga</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(yearlyBreakdown.totalIncome)}</p>
                <p className="text-xs text-green-600">{yearlyBreakdown.totalPaidFees} arday</p>
              </div>
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <p className="text-sm text-red-700 mb-1">Wadarta Kharashka</p>
                <p className="text-2xl font-bold text-red-800">{formatCurrency(yearlyBreakdown.totalExpenses)}</p>
                <p className="text-xs text-red-600">{yearlyBreakdown.totalPaidSalaries} macallin</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <p className="text-sm text-orange-700 mb-1">Wadarta Qaansheega</p>
                <p className="text-2xl font-bold text-orange-800">{formatCurrency(yearlyBreakdown.totalDebt)}</p>
                <p className="text-xs text-orange-600">{yearlyBreakdown.totalUnpaidFees} arday</p>
              </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bisha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dakhliga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kharashka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qaansheega</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faahfaahin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {yearlyBreakdown.monthlyBreakdown.map((month) => (
                    <tr key={month.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getMonthName(month.month)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {formatCurrency(month.expenses)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                        {formatCurrency(month.debt)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        month.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(month.netProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Waa la soo dejiniyaa faahfaahinta...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Faahfaahinta Maalgelinta</h3>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">•</div>
              <p><strong>Dakhliga:</strong> Waa lacagta ardayda ee la bixiyay bishan</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">•</div>
              <p><strong>Kharashka:</strong> Waa mushaharka macalimiinta ee la bixiyay bishan</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">•</div>
              <p><strong>Qaansheega:</strong> Waa lacagta ardayda ee aan la bixin bishan</p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 text-sm font-bold mr-3 mt-0.5">•</div>
              <p><strong>Faahfaahin:</strong> Waa dakhliga kaaga kharashka (Dakhliga - Kharashka)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;