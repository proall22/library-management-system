"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { reservationsApi } from "../services/api"

const Reservations: React.FC = () => {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user?.member) {
      fetchReservations()
    }
  }, [user])

  const fetchReservations = async () => {
    if (!user?.member) return

    try {
      const response = await reservationsApi.getMemberReservations(user.member.name)
      if (response.data.success && response.data.data) {
        setReservations(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
      setError("Failed to load reservations")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return
    }

    try {
      const response = await reservationsApi.cancel(reservationId)
      if (response.data.success) {
        setSuccess("Reservation cancelled successfully!")
        fetchReservations() // Refresh data
      } else {
        setError(response.data.error || "Failed to cancel reservation")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">My Reservations</h1>
        <p className="mt-2 text-sm text-gray-700">View and manage your book reservations.</p>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations</h3>
          <p className="text-gray-500">You haven't reserved any books yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <li key={reservation.name} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{reservation.book_title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservation.status === "Ready"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : reservation.status === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {reservation.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">by {reservation.author}</p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Reserved: {reservation.reserve_date}
                        </p>
                        {reservation.status === "Pending" && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Queue position: #{reservation.queue_position}
                          </p>
                        )}
                        {reservation.expiry_date && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Expires: {reservation.expiry_date}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        {reservation.status === "Ready" && (
                          <div className="mr-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ready for pickup!
                            </span>
                          </div>
                        )}
                        {(reservation.status === "Pending" || reservation.status === "Ready") && (
                          <button
                            onClick={() => handleCancel(reservation.name)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
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
  )
}

export default Reservations
