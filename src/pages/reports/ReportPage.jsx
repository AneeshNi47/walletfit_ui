import { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/Modal';
import Select from 'react-select'; // For account and category selection
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Styles for the date picker

export default function ReportPage() {
  const { auth, logout } = useAuth();

  // --- Filter States ---
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    selectedAccounts: [], // { value: id, label: name } format
    selectedCategories: [], // { value: id, label: name } format
    type: '', // 'expense', 'top_up', 'transfer_out', 'transfer_in'
    minAmount: '',
    maxAmount: '',
    isCredit: false,
    isDebit: false,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters); // Filters actually applied to the report

  // --- Data States ---
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Matches backend default

  // --- Options for Filters (fetched from API) ---
  const [accountsOptions, setAccountsOptions] = useState([]);
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  // --- Saved Report States ---
  const [savedReports, setSavedReports] = useState([]);
  const [showSaveReportModal, setShowSaveReportModal] = useState(false);
  const [saveReportName, setSaveReportName] = useState('');
  const [saveReportDescription, setSaveReportDescription] = useState('');
  const [saveReportError, setSaveReportError] = useState('');
  const [showLoadReportModal, setShowLoadReportModal] = useState(false);

  // --- Export Handlers ---
  const [exportLoading, setExportLoading] = useState({ excel: false, pdf: false });

  // --- Fetching all accounts and categories for filter dropdowns ---
  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError('');
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        axios.get('/accounts/', { headers: { Authorization: `Bearer ${auth?.access}` } }),
        axios.get('/categories/', { headers: { Authorization: `Bearer ${auth?.access}` } }),
      ]);
      setAccountsOptions(accountsRes.data.results.map(acc => ({ value: acc.id, label: acc.name })));
      setCategoriesOptions(categoriesRes.data.results.map(cat => ({ value: cat.id, label: cat.name })));
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      setOptionsError('Failed to load filter options.');
      if (err?.response?.status === 401) logout();
    } finally {
      setLoadingOptions(false);
    }
  }, [auth, logout]);

  // --- Fetching Saved Reports ---
  const fetchSavedReports = useCallback(async () => {
    try {
      const response = await axios.get('/users/reports/saved/', {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      console.log(response)
      setSavedReports(response.data.results);
    } catch (err) {
      console.error('Failed to fetch saved reports:', err);
      // No critical error display for this, but log it.
    }
  }, [auth]);

  // --- Main Report Data Fetching Function ---
  // Now uses `appliedFilters` to trigger API call
  const fetchReportData = useCallback(async () => {
    console.log('fetchReportData called with appliedFilters:', appliedFilters); // Debug log
    setLoadingReport(true);
    setReportError('');

    const params = new URLSearchParams();
    if (appliedFilters.startDate) params.append('start_date', appliedFilters.startDate.toISOString().split('T')[0]);
    if (appliedFilters.endDate) params.append('end_date', appliedFilters.endDate.toISOString().split('T')[0]);
    if (appliedFilters.selectedAccounts.length > 0) params.append('accounts', appliedFilters.selectedAccounts.map(acc => acc.value).join(','));
    if (appliedFilters.selectedCategories.length > 0) params.append('categories', appliedFilters.selectedCategories.map(cat => cat.value).join(','));
    if (appliedFilters.type) params.append('type', appliedFilters.type);
    if (appliedFilters.minAmount) params.append('min_amount', appliedFilters.minAmount);
    if (appliedFilters.maxAmount) params.append('max_amount', appliedFilters.maxAmount);
    if (appliedFilters.isCredit) params.append('is_credit', 'true');
    if (appliedFilters.isDebit) params.append('is_debit', 'true');

    params.append('page', currentPage);
    params.append('page_size', pageSize);

    console.log('Making API call with params:', params.toString()); // Debug log

    try {
      const response = await axios.get(`/users/reports/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      console.log('API response:', response.data); // Debug log
      setReportData(response.data.results);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setReportError('Failed to load report data. Please adjust filters.');
      if (err?.response?.status === 401) logout();
    } finally {
      setLoadingReport(false);
    }
  }, [auth, logout, appliedFilters, currentPage, pageSize]); // Depends on appliedFilters now

  // --- Effects ---
  useEffect(() => {
    if (auth?.access) {
      fetchOptions();
      fetchSavedReports();
    }
  }, [auth, fetchOptions, fetchSavedReports]);

  // Effect to trigger report data fetching when applied filters or pagination changes
  useEffect(() => {
    if (auth?.access) {
      fetchReportData();
    }
  }, [auth, fetchReportData]);

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Don't apply filters immediately, wait for "Apply Filters" click
  };

  const handleDateChange = (date, name) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (selectedOptions, { name }) => {
    setFilters(prev => ({ ...prev, [name]: selectedOptions }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters); // Debug log
    setAppliedFilters({...filters}); // Create a new object to ensure state change is detected
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    const defaultFilters = {
      startDate: null, endDate: null, selectedAccounts: [], selectedCategories: [],
      type: '', minAmount: '', maxAmount: '', isCredit: false, isDebit: false,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters); // Also clear applied filters
    setCurrentPage(1); // Reset page
  };

  // --- Pagination Handlers ---
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // --- Save/Load Report Handlers ---
  const handleSaveReport = async () => {
    if (!saveReportName.trim()) {
      setSaveReportError('Report name cannot be empty.');
      return;
    }
    
    // Prepare filters in the new format
    const filtersToSave = {
      transaction_types: filters.type ? [filters.type] : [],
      categories: filters.selectedCategories.map(cat => cat.label),
      start_date: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
      end_date: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
      min_amount: filters.minAmount || null,
      max_amount: filters.maxAmount || null,
      accounts: filters.selectedAccounts.map(acc => acc.value),
    };

    try {
      await axios.post('/users/reports/saved/', {
        name: saveReportName,
        description: saveReportDescription,
        filters: filtersToSave,
      }, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setShowSaveReportModal(false);
      setSaveReportName('');
      setSaveReportDescription('');
      setSaveReportError('');
      fetchSavedReports(); // Refresh saved reports list
    } catch (err) {
      console.error('Failed to save report:', err);
      setSaveReportError('Failed to save report. Name might already exist or invalid.');
    }
  };

  const handleLoadReport = (savedFilterObj) => {
    const savedFilters = savedFilterObj.filters;

    // Re-map the new filter structure back to our component format
    const remappedFilters = {
        startDate: savedFilters.start_date ? new Date(savedFilters.start_date) : null,
        endDate: savedFilters.end_date ? new Date(savedFilters.end_date) : null,
        selectedAccounts: accountsOptions.filter(opt => savedFilters.accounts?.includes(opt.value)),
        selectedCategories: categoriesOptions.filter(opt => savedFilters.categories?.includes(opt.label)),
        type: savedFilters.transaction_types?.[0] || '',
        minAmount: savedFilters.min_amount || '',
        maxAmount: savedFilters.max_amount || '',
        isCredit: false, // Not in new structure, default to false
        isDebit: false,  // Not in new structure, default to false
    };
    setFilters(remappedFilters); // Update the current filter inputs
    setAppliedFilters(remappedFilters); // Immediately apply them
    setShowLoadReportModal(false);
    setCurrentPage(1); // Reset page after loading filters
  };

  const handleDeleteSavedReport = async (reportId) => {
    try {
      await axios.delete(`/users/reports/saved/${reportId}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      fetchSavedReports(); // Refresh saved reports list
    } catch (err) {
      console.error('Failed to delete saved report:', err);
      // Handle error display
    }
  };

  // --- Export Handlers ---
  const handleExport = async (format) => {
    setExportLoading(prev => ({ ...prev, [format]: true }));
    try {
      const filtersToSend = {
        startDate: appliedFilters.startDate ? appliedFilters.startDate.toISOString().split('T')[0] : null,
        endDate: appliedFilters.endDate ? appliedFilters.endDate.toISOString().split('T')[0] : null,
        accounts: appliedFilters.selectedAccounts.map(acc => acc.value),
        categories: appliedFilters.selectedCategories.map(cat => cat.value),
        type: appliedFilters.type,
        minAmount: appliedFilters.minAmount,
        maxAmount: appliedFilters.maxAmount,
        isCredit: appliedFilters.isCredit,
        isDebit: appliedFilters.isDebit,
      };

      const params = new URLSearchParams();
      params.append('filters', JSON.stringify(filtersToSend));

      const response = await axios.get(`/users/reports/export/${format}/?${params.toString()}`, {
        headers: { 
          Authorization: `Bearer ${auth?.access}`,
        },
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `walletfit_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export ${format}:`, err);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
      if (err?.response?.status === 401) logout();
    } finally {
      setExportLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  if (loadingOptions) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl text-gray-700">
        Loading Report Options...
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500 text-xl">
        <p>Error: {optionsError}</p>
        <button onClick={fetchOptions} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Financial Reports</h1>

        {/* --- Filter Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select start date"
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select end date"
                isClearable
              />
            </div>
            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accounts:</label>
              <Select
                name="selectedAccounts"
                options={accountsOptions}
                value={filters.selectedAccounts}
                onChange={handleSelectChange}
                isMulti
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select accounts..."
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Quick Date Range:</label>
  <select
    name="dateRange"
    value={filters.dateRange}
    onChange={handleFilterChange}
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Custom Range</option>
    <option value="today">Today</option>
    <option value="last_7_days">Last 7 Days</option>
    <option value="last_30_days">Last 30 Days</option>
    <option value="this_month">This Month</option>
    <option value="last_month">Last Month</option>
    <option value="this_year">This Year</option>
  </select>
</div>
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories:</label>
              <Select
                name="selectedCategories"
                options={categoriesOptions}
                value={filters.selectedCategories}
                onChange={handleSelectChange}
                isMulti
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            </div>
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type:</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="top_up">Top Up</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="transfer_in">Transfer In</option>
              </select>
            </div>
            {/* Amount Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount:</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                placeholder="e.g., 10.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount:</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                placeholder="e.g., 100.00"
              />
            </div>
            {/* Credit/Debit Checkboxes */}
            <div className="flex items-end gap-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isCredit"
                        checked={filters.isCredit}
                        onChange={handleFilterChange}
                        id="isCredit"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isCredit" className="ml-2 text-sm font-medium text-gray-700">Is Credit</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isDebit"
                        checked={filters.isDebit}
                        onChange={handleFilterChange}
                        id="isDebit"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDebit" className="ml-2 text-sm font-medium text-gray-700">Is Debit</label>
                </div>
            </div>
          </div> {/* End Filter grid */}

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div> {/* End Filter Section */}

        {/* --- Saved Reports & Export Section --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-md space-y-4 sm:space-y-0 sm:space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Report Actions</h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                <button
                    onClick={() => setShowSaveReportModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
                >
                    💾 Save Current Filters
                </button>
                <button
                    onClick={() => setShowLoadReportModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-200"
                >
                    📂 Load Saved Report
                </button>
                <button
                    onClick={() => handleExport('excel')}
                    disabled={exportLoading.excel}
                    className={`px-4 py-2 text-white rounded-md transition duration-200 ${
                      exportLoading.excel 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {exportLoading.excel ? '⏳ Exporting...' : '📊 Export to Excel'}
                </button>
                <button
                    onClick={() => handleExport('pdf')}
                    disabled={exportLoading.pdf}
                    className={`px-4 py-2 text-white rounded-md transition duration-200 ${
                      exportLoading.pdf 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {exportLoading.pdf ? '⏳ Exporting...' : '📄 Export to PDF'}
                </button>
            </div>
        </div>

        {/* --- Report Results Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Report Results</h2>
          {loadingReport ? (
            <p className="text-center text-gray-500 py-8">Loading report data...</p>
          ) : reportError ? (
            <p className="text-center text-red-500 py-8">Error: {reportError}</p>
          ) : reportData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activities found matching the selected filters. Try adjusting your criteria.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((activity) => (
                      <tr key={`${activity.type}-${activity.id}-${activity.created_at}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{activity.type.replace(/_/g, ' ')}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.amount > 0 ? '+' : ''}{parseFloat(activity.amount).toFixed(2)} {activity.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.account_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.category_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{activity.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.related_account_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition duration-200"
                  >
                    Next
                  </button>
                </div>
                <div>
                  <label htmlFor="pageSizeSelect" className="text-sm text-gray-700 mr-2">Items per page:</label>
                  <select
                    id="pageSizeSelect"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div> {/* End Report Results Section */}
      </main>


      {/* --- Modals for Save/Load Report --- */}
      {showSaveReportModal && (
        <Modal title="💾 Save Report Filters" onClose={() => setShowSaveReportModal(false)}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter a name for this report"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={saveReportName}
              onChange={(e) => setSaveReportName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Enter a description for this report"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={saveReportDescription}
              onChange={(e) => setSaveReportDescription(e.target.value)}
            />
            {saveReportError && <p className="text-red-500 text-sm mt-1">{saveReportError}</p>}
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setShowSaveReportModal(false); setSaveReportError(''); setSaveReportName(''); setSaveReportDescription(''); }} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200">Cancel</button>
              <button onClick={handleSaveReport} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200">Save Report</button>
            </div>
          </div>
        </Modal>
      )}

      {showLoadReportModal && (
        <Modal title="📂 Load Saved Report" onClose={() => setShowLoadReportModal(false)}>
          <div className="space-y-3">
            {savedReports.length === 0 ? (
              <p className="text-gray-500 text-center">No saved reports found. Save one first!</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {savedReports.map((report) => (
                  <li key={report.id} className="py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <p className="font-medium text-gray-800">{report.name}</p>
                      {report.description && (
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      )}
                      <p className="text-xs text-gray-500">Saved: {new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button onClick={() => handleLoadReport(report)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-200">Load</button>
                      <button onClick={() => handleDeleteSavedReport(report.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition duration-200">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
             <div className="flex justify-end mt-4">
                <button onClick={() => setShowLoadReportModal(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}