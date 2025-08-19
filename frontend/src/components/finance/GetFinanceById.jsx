import { useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import useFinanceStore from '../../store/financeStore';
import PrintButton from '../common/PrintButton';

const GetFinanceById = () => {
  const { financeId } = useParams();
  const navigate = useNavigate();
  const { currentFinance, loading, getFinanceById, clearMessages } = useFinanceStore();

  useEffect(() => {
    if (financeId) {
      getFinanceById(financeId);
    }
    return () => clearMessages();
  }, [financeId, getFinanceById, clearMessages]);

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

  const calculateProfit = () => {
    if (!currentFinance) return 0;
    return (currentFinance.income || 0) - (currentFinance.expenses || 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Soo dejinta macluumaadka dhaqaalaha...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFinance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Dhaqaalaha lama helin</h3>
              <p className="mt-1 text-sm text-gray-500">Dhaqaalaha aad raadineyso ma jiro ama waxaa dhacay khalad</p>
              <button
                onClick={() => navigate('/finance/getAll')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiArrowLeft className="mr-2" />
                Dib ugu noqo dhaqaalaha
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profit = calculateProfit();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/finance/getAll')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
              >
                <FiArrowLeft className="mr-2" />
                Dib ugu noqo dhaqaalaha
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FiDollarSign className="mr-3 text-green-600" />
                 Dhaqaalaha Bilaha
              </h1>
              <p className="text-gray-600 mt-2">
                Eeg faahfaahinta dhaqaalaha
              </p>
            </div>
            
            {currentFinance && (
              <PrintButton
                title="Qoraal Dhaqaalaha"
                subtitle={`Dhaqaalaha ${formatDate(currentFinance.date)}`}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {`
                  <div class="info-section">
                    <div class="info-label">Macluumaadka Dhaqaalaha</div>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-key">Taariikhda:</span>
                        <span class="info-value">${formatDate(currentFinance.date)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Dakhliga:</span>
                        <span class="info-value">${formatCurrency(currentFinance.income)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Kharashka:</span>
                        <span class="info-value">${formatCurrency(currentFinance.expenses)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Qaansheega:</span>
                        <span class="info-value">${formatCurrency(currentFinance.debt)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Faahfaahin:</span>
                        <span class="info-value">${formatCurrency(profit)}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-key">Heerka Faahfaahinta:</span>
                        <span class="info-value">${profit >= 0 ? 'Wanaagsan' : 'Xun'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="summary-stats">
                    <div class="stat-item">
                      <div class="stat-number">${formatCurrency(currentFinance.income)}</div>
                      <div class="stat-label">Dakhliga</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${formatCurrency(currentFinance.expenses)}</div>
                      <div class="stat-label">Kharashka</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${formatCurrency(currentFinance.debt)}</div>
                      <div class="stat-label">Qaansheega</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">${formatCurrency(profit)}</div>
                      <div class="stat-label">Faahfaahin</div>
                    </div>
                  </div>
                  
                  <div class="additional-info">
                    <h4>Macluumaad Dheeraad ah</h4>
                    <ul>
                      <li>• maaliyada waxay ku saabsan tahay ${formatDate(currentFinance.date)}</li>
                      <li>• Dakhliga wuxuu ka kooban yahay lacagta la soo galay</li>
                      <li>• Kharashka wuxuu ka kooban yahay lacagta la bixiyay</li>
                      <li>• daynta wuxuu ka kooban yahay deynta la qaaday</li>
                      <li>• Faahfaahinta waxay ka dhigantahay farqiga u dhexeeya dakhliga iyo kharashka</li>
                    </ul>
                  </div>
                `}
              </PrintButton>
            )}
          </div>
        </div>

        {/* Finance Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              Dhaqaalaha {formatDate(currentFinance.date)}
            </h2>
          </div>

          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Income */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Dakhliga</p>
                    <p className="text-2xl font-bold">{formatCurrency(currentFinance.income)}</p>
                  </div>
                  <FiTrendingUp className="text-3xl text-green-200" />
                </div>
              </div>

              {/* Expenses */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Kharashka</p>
                    <p className="text-2xl font-bold">{formatCurrency(currentFinance.expenses)}</p>
                  </div>
                  <FiTrendingDown className="text-3xl text-red-200" />
                </div>
              </div>

              {/* Debt */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Daynta</p>
                    <p className="text-2xl font-bold">{formatCurrency(currentFinance.debt)}</p>
                  </div>
                  <FiCreditCard className="text-3xl text-orange-200" />
                </div>
              </div>

              {/* Profit */}
              <div className={`rounded-lg shadow-lg p-6 text-white ${
                profit >= 0 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Faahfaahin</p>
                    <p className="text-2xl font-bold">{formatCurrency(profit)}</p>
                  </div>
                  <FiDollarSign className="text-3xl opacity-80" />
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Faahfaahin Dhammeystiran</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Taariikhda:</span>
                    <span className="text-gray-900 font-semibold">{formatDate(currentFinance.date)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Dakhliga:</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(currentFinance.income)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Kharashka:</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(currentFinance.expenses)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Daynta:</span>
                    <span className="text-orange-600 font-semibold">{formatCurrency(currentFinance.debt)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Faahfaahin:</span>
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Heerka Faahfaahinta:</span>
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? 'Wanaagsan' : 'Xun'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Macluumaad Dheeraad ah</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Dhaqaalahan wuxuu ku saabsan yahay {formatDate(currentFinance.date)}</p>
                <p>• Dakhliga wuxuu ka kooban yahay lacagta la soo galay</p>
                <p>• Kharashka wuxuu ka kooban yahay lacagta la bixiyay</p>
                <p>• Qaansheega wuxuu ka kooban yahay deynta la qaaday</p>
                <p>• Faahfaahinta waxay ka dhigantahay farqiga u dhexeeya dakhliga iyo kharashka</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetFinanceById;