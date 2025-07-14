"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { reportsApi } from "../services/api"

const Reports: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("active-loans")
  const [activeLoansData, setActiveLoansData] = useState<any>(null)
  const [overdueData, setOverdueData] = useState<any>(null)
  const [popularBooks, setPopularBooks] = useState<any[]>([])
  const [memberActivity, setMemberActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  useEffect(() => {
    if (isLibrarian) {
      fetchReports()
    }
  }, [isLibrarian])

  const fetchReports = async () => {
    try {
      const [activeLoansResponse, overdueResponse, popularResponse, activityResponse] = await Promise.all([
        reportsApi.getActiveLoans(),
        reportsApi.getOverdueBooks(),
        reportsApi.getPopularBooks(10),
        reportsApi.getMemberActivity(10),
      ])

      if (activeLoansResponse.data.success) {
        setActiveLoansData(activeLoansResponse.data.data)
      }

      if (overdueResponse.data.success) {
        setOverdueData(overdueResponse.data.data)
      }

      if (popularResponse.data.success) {
        setPopularBooks(popularResponse.data.data || [])
      }

      if (activityResponse.data.success) {
        setMemberActivity(activityResponse.data.data || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  if (!isLibrarian) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to view reports.</p>
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

  const tabs = [
    { id: "active-loans", name: "Active Loans", icon: "📖" },
    { id: "overdue", name: "Overdue Books", icon: "⚠️" },
    { id: "popular", name: "Popular Books", icon: "⭐" },
    { id: "members", name: "Member Activity", icon: "👥" },
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">View library statistics and generate reports.</p>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Loans Report */}
      {activeTab === "active-loans" && activeLoansData && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📖</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Active</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {activeLoansData.statistics.total_active_loans}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⚠️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-red-600">{activeLoansData.statistics.overdue_loans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Due Soon</dt>
                      <dd className="text-lg font-medium text-yellow-600">
                        {activeLoansData.statistics.due_soon_loans}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">On Time</dt>
                      <dd className="text-lg font-medium text-green-600">{activeLoansData.statistics.active_loans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Active Loans Details</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {activeLoansData.loans.map((loan: any) => (
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
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Overdue Books Report */}
      {activeTab === "overdue" && overdueData && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⚠️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Overdue</dt>
                      <dd className="text-lg font-medium text-red-600">{overdueData.statistics.total_overdue}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Fines</dt>
                      <dd className="text-lg font-medium text-red-600">
                        ${overdueData.statistics.total_estimated_fines.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {overdueData.overdue_loans.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Overdue Books Details</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {overdueData.overdue_loans.map((loan: any) => (
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
                              Email: {loan.email}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              Due: {loan.return_date}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-red-600 sm:mt-0 sm:ml-6">
                              Fine: ${loan.estimated_fine.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No overdue books</h3>
              <p className="text-gray-500">All books are returned on time!</p>
            </div>
          )}
        </div>
      )}

      {/* Popular Books Report */}
      {activeTab === "popular" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Most Popular Books</h3>
            <p className="mt-1 text-sm text-gray-500">Based on loan frequency and current reservations</p>
          </div>
          {popularBooks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {popularBooks.map((book, index) => (
                <li key={book.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                        <p className="text-sm text-gray-500">by {book.author}</p>
                        {book.category && <p className="text-xs text-gray-400">{book.category}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{book.loan_count} loans</p>
                      {book.reservation_count > 0 && (
                        <p className="text-sm text-orange-600">{book.reservation_count} reservations</p>
                      )}
                      {book.current_loans > 0 && (
                        <p className="text-sm text-blue-600">{book.current_loans} currently on loan</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-500">No books have been loaned yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Member Activity Report */}
      {activeTab === "members" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Most Active Members</h3>
            <p className="mt-1 text-sm text-gray-500">Based on total loans and recent activity</p>
          </div>
          {memberActivity.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {memberActivity.map((member, index) => (
                <li key={member.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{member.name1}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">ID: {member.membership_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{member.total_loans} total loans</p>
                      {member.active_loans > 0 && <p className="text-sm text-blue-600">{member.active_loans} active</p>}
                      {member.overdue_loans > 0 && (
                        <p className="text-sm text-red-600">{member.overdue_loans} overdue</p>
                      )}
                      {member.last_loan_date && (
                        <p className="text-xs text-gray-500">Last loan: {member.last_loan_date}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-500">No member activity to display.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
