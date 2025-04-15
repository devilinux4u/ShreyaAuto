"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  FileText,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/api/transaction"); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();

        console.log(data.data);

        // Ensure transactions is an array
        setTransactions(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "khalti":
        return <CreditCard className="w-5 h-5" />;
      case "paypal":
        return <DollarSign className="w-5 h-5" />;
      case "bank_transfer":
        return <ArrowUpRight className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  // Calculate total amounts
  const totalAmount = transactions.reduce((sum, trx) => sum + (trx.amount || 0), 0);
  const completedAmount = transactions
    .filter((trx) => trx.status === "paid")
    .reduce((sum, trx) => sum + (trx.amount || 0), 0);
  const pendingAmount = transactions
    .filter((trx) => trx.status === "pending")
    .reduce((sum, trx) => sum + (trx.amount || 0), 0);


  const filteredTransactions = transactions.filter((transaction) => {
    const customer = transaction.user?.fname?.toLowerCase() || "";
    const matchesSearch = customer.includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || transaction.type === filterType;

    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 ml-0 md:ml-64 min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="border-l-4 border-[#ff6b00] pl-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Transactions
            </h1>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Transaction Management
          </h1>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500">Total Transactions</h3>
                <div className="p-3 bg-[#4F46E5]/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-[#4F46E5]" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">
                Rs. {totalAmount.toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                {transactions.length} transactions
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500">Completed</h3>
                <div className="p-3 bg-green-100 rounded-full">
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">
                Rs. {completedAmount.toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-green-600">
                Successfully processed
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500">Pending</h3>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <ArrowDownRight className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">
                Rs. {pendingAmount.toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-yellow-600">
                Awaiting completion
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="rental">Rental</option>
                <option value="rental_deposit">Rental Deposit</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.Booking.User.fname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.Booking.User.uname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rs. {transaction.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {getPaymentMethodIcon(transaction.method)}
                        <span className="ml-2">
                          {transaction.method
                          }
                          {transaction.cardLast4 &&
                            ` (*${transaction.cardLast4})`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        {transaction.status === "completed" && (
                          <button className="text-[#4F46E5] hover:text-[#4338CA] transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Component */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-center mt-10">
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border-r border-gray-200 flex items-center ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-4 py-2 border-r border-gray-200 ${currentPage === number
                        ? "bg-orange-500 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 flex items-center ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTransaction(null)}
          >
            <div
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Transaction Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    View transaction information and process refunds
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Transaction ID
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedTransaction.id}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Order ID
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedTransaction.pxid}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Amount
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      Rs. {selectedTransaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Status
                    </h3>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Payment Method
                    </h3>
                    <div className="flex items-center mt-1">
                      {getPaymentMethodIcon(selectedTransaction.method)}
                      <span className="ml-2 text-gray-900">
                        {selectedTransaction.method
                          }
                        {selectedTransaction.cardLast4 &&
                          ` (*${selectedTransaction.cardLast4})`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedTransaction.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                {selectedTransaction.status === "completed" && (
                  <button className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] font-medium">
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}