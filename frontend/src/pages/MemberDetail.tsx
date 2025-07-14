"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { membersApi } from "../services/api"

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [memberData, setMemberData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  useEffect(() => {
    if (id && isLibrarian) {
      fetchMemberDetails()
    }
  }, [id, isLibrarian])

  const fetchMemberDetails = async () => {
    if (!id) return

    try {
      const response = await membersApi.getById(id)
      if (response.data.success && response.data.data) {
        setMemberData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching member details:", error)
      setError("Failed to load member details")
    } finally {
      setLoading(false)
    }
  }

  if (!isLibrarian) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to view member details.</p>
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

  if (!memberData) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Member not found</h3>
        <Link to="/members" className="text-blue-600 hover:text-blue-500">
          ← Back to Members
        </Link>
      </div>
    )
  }

  const { member, active_loans, loan_history, reservations } = memberData

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link to="/members" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          ← Back to Members
        </Link>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Member Info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name1}</h1>
              <p className="mt-1 text-lg text-gray-600">{member.membership_id}</p>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                member.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : member.status === "Inactive"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {member.status}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.email}</dd>
            </div>
            {member.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Join Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.join_date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Active Loans</dt>
              <dd className="mt-1 text-sm text-gray-900">{active_loans.length}</dd>
            </div>
            {member.address && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.address}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Active Loans */}
      {active_loans.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {active_loans.map((loan: any) => (
                <li key={loan.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{loan.book}</p>
                      <p className="text-sm text-gray-500">Loaned: {loan.loan_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">Due: {loan.return_date}</p>
                      {new Date(loan.return_date) < new Date() && (
                        <p className="text-sm text-red-600 font-medium">Overdue</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Reservations */}
      {reservations.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Active Reservations</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {reservations.map((reservation: any) => (
                <li key={reservation.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{reservation.book}</p>
                      <p className="text-sm text-gray-500">Reserved: {reservation.reserve_date}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.status === "Ready"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {reservation.status}
                      </span>
                      {reservation.expiry_date && (
                        <p className="text-sm text-gray-500 mt-1">Expires: {reservation.expiry_date}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loan History */}
      {loan_history.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Loan History</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {loan_history.map((loan: any) => (
                <li key={loan.name} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{loan.book}</p>
                      <p className="text-sm text-gray-500">
                        {loan.loan_date} - {loan.actual_return_date}
                      </p>
                    </div>
                    <div className="text-right">
                      {loan.fine_amount > 0 && <p className="text-sm text-red-600">Fine: ${loan.fine_amount}</p>}
                      <p className="text-sm text-green-600">Returned</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberDetail
