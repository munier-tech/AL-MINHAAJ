import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiCalendar, FiEye, FiSearch } from 'react-icons/fi';
import useFinanceStore from '../../store/financeStore';
import PrintButton from '../common/PrintButton';

const GetAllFinance = () => {
  const { 
    finances, 
    loading, 
    getAllFinance, 
    getTotalIncome, 
    getTotalExpenses, 
    getTotalDebt, 
    getNetProfit 
  } = useFinanceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFinances, setFilteredFinances] = useState([]);

  useEffect(() => {
    getAllFinance();
  }, [getAllFinance]);

  useEffect(() => {
    if (finances.length > 0) {
      const filtered = finances.filter(finance => {
        const date = new Date(finance.date).toLocaleDateString('so-SO');
        const income = finance.income?.toString() || '';
        const expenses = finance.expenses?.toString() || '';
        const debt = finance.debt?.toString() || '';
        
        return date.includes(searchQuery) || 
               income.includes(searchQuery) || 
               expenses.includes(searchQuery) || 
               debt.includes(searchQuery);
      });
      setFilteredFinances(filtered);
    } else {
      setFilteredFinances([]);
    }
  }, [finances, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('so-SO', {
      style: 'currency',
      currency: 'SOS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('so-SO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const totalDebt = getTotalDebt();
  const netProfit = getNetProfit();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FiDollarSign className="mr-3 text-green-600" />
            Maalgelinta Guud
          </h1>
          <p className="text-gray-600 mt-2">
            Eeg dhammaan macluumaadka maalgelinta
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Wadarta Dakhliga</p>
                <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
              </div>
              <FiTrendingUp className="text-3xl text-green-200" />
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Wadarta Kharashka</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
              <FiTrendingDown className="text-3xl text-red-200" />
            </div>
          </div>

          {/* Total Debt */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Wadarta Qaansheega</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
              </div>
              <FiCreditCard className="text-3xl text-orange-200" />
            </div>
          </div>

          {/* Net Profit */}
          <div className={`rounded-lg shadow-lg p-6 text-white ${
            netProfit >= 0 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Faahfaahin</p>
                <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
              </div>
              <FiDollarSign className="text-3xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi maalgelinta..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {finances.length > 0 && (
              <PrintButton
                title="Qoraal Maalgelinta"
                subtitle={`Wadarta: ${formatCurrency(totalIncome)} | Kharashka: ${formatCurrency(totalExpenses)} | Qaansheega: ${formatCurrency(totalDebt)}`}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {`
                  <div class="info-section">
                    <div class="info-label">Tirakoobka Maalgelinta</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-key">Wadarta Dakhliga:</span>
                        <span class="info-value">${formatCurrency(totalIncome)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Wadarta Kharashka:</span>
                        <span class="info-value">${formatCurrency(totalExpenses)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Wadarta Qaansheega:</span>
                        <span class="info-value">${formatCurrency(totalDebt)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Faahfaahin:</span>
                        <span class="info-value">${formatCurrency(netProfit)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <table>
                    <thead>
                      <tr>
                        <th>Taariikhda</th>
                        <th>Dakhliga</th>
                        <th>Kharashka</th>
                        <th>Qaansheega</th>
                        <th>Faahfaahin</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredFinances.map((finance) => {
                        const profit = (finance.income || 0) - (finance.expenses || 0);
                        return `
                          <tr>
                            <td>${formatDate(finance.date)}</td>
                            <td>${formatCurrency(finance.income)}</td>
                            <td>${formatCurrency(finance.expenses)}</td>
                            <td>${formatCurrency(finance.debt)}</td>
                            <td class="${profit >= 0 ? 'grade-A' : 'grade-F'}">${formatCurrency(profit)}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                `}
              </PrintButton>
            )}
          </div>
        </div>

        {/* Finance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Soo dejinta maalgelinta...</p>
            </div>
          ) : filteredFinances.length === 0 ? (
            <div className="p-8 text-center">
              <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'Maalgelinta aad raadineyso ma helin' : 'Maalgelin lama helin'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Fadlan isku day inaad beddesho raadinta' : 'Ku dar maalgelin cusub si aad u bilowdo'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiCalendar className="inline mr-1" />
                      Taariikhda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiTrendingUp className="inline mr-1 text-green-600" />
                      Dakhliga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiTrendingDown className="inline mr-1 text-red-600" />
                      Kharashka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiCreditCard className="inline mr-1 text-orange-600" />
                      Qaansheega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FiDollarSign className="inline mr-1" />
                      Faahfaahin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFinances.map((finance) => {
                    const profit = (finance.income || 0) - (finance.expenses || 0);
                    return (
                      <tr key={finance._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(finance.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(finance.income)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(finance.expenses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                          {formatCurrency(finance.debt)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetAllFinance;