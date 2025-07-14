"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { loansApi } from "../services/api"

const Loans: React.FC = () => {
  const { user } = useAuth()
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [overdueLoans, setOverdueLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  useEffect(() => {
    if (isLibrarian) {
      fetchLoans()
    }
  }, [isLibrarian])

  const fetchLoans = async () => {
    try {
      const [activeResponse, overdueResponse] = await Promise.all([loansApi.getActive(), loansApi.getOverdue()])

      if (activeResponse.data.success && activeResponse.data.data) {
        setActiveLoans(activeResponse.data.data)
      }

      if (overdueResponse.data.success && overdueResponse.data.data) {
        setOverdueLoans(overdueResponse.data.data)
      }
    } catch (error) {
      console.error("Error fetching loans:", error)
      setError("Failed to load loans")
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (loanId: string) => {
    if (!confirm("Are you sure you want to mark this book as returned?")) {
      return
    }

    try {
      const response = await loansApi.returnBook(loanId)
      if (response.data.success) {
        setSuccess("Book returned successfully!")
        fetchLoans() // Refresh data
      } else {
        setError(response.data.error || "Failed to return book")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  if (!isLibrarian) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to view loans.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Loans Management</h1>
        <p className="mt-2 text-sm text-gray-700">Manage active and overdue book loans.</p>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      {/* Overdue Loans */}
      {overdueLoans.length > 0 && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-red-400 text-xl">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Overdue Books ({overdueLoans.length})</h3>
                <p className="mt-1 text-sm text-red-700">
                  These books are past their return date and require immediate attention.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {overdueLoans.map((loan) => (
                <li key={loan.name} className="px-4 py-4 sm:px-6 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{loan.book_title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {loan.days_overdue} days overdue
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">Member: {loan.member_name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Due: {loan.return_date}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <button
                            onClick={() => handleReturn(loan.name)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            Mark as Returned
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Active Loans */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Loans ({activeLoans.length})</h2>

        {activeLoans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active loans</h3>
            <p className="text-gray-500">All books are currently available.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {activeLoans.map((loan) => (
                <li key={loan.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{loan.book_title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.status === "Overdue"
                                ? "bg-red-100 text-red-800"
                                : loan.status === "Due Soon"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {loan.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">Member: {loan.member_name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Due: {loan.return_date}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Days remaining: {loan.days_remaining}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <button
                            onClick={() => handleReturn(loan.name)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Mark as Returned
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loans
