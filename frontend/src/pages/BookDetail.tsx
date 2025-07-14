"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { booksApi, reservationsApi, loansApi } from "../services/api"
import type { Book } from "../types"

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [currentLoan, setCurrentLoan] = useState<any>(null)
  const [reservationCount, setReservationCount] = useState(0)
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  useEffect(() => {
    if (id) {
      fetchBookDetails()
    }
  }, [id])

  const fetchBookDetails = async () => {
    if (!id) return

    try {
      const response = await booksApi.getById(id)
      if (response.data.success && response.data.data) {
        setBook(response.data.data.book)
        setCurrentLoan(response.data.data.current_loan)
        setReservationCount(response.data.data.reservation_count)
      }

      // Fetch reservations if librarian
      if (isLibrarian) {
        const reservationsResponse = await reservationsApi.getBookReservations(id)
        if (reservationsResponse.data.success && reservationsResponse.data.data) {
          setReservations(reservationsResponse.data.data)
        }
      }
    } catch (error) {
      console.error("Error fetching book details:", error)
      setError("Failed to load book details")
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (!book || !user?.member) {
      setError("Unable to create reservation")
      return
    }

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await reservationsApi.create({
        book: book.name,
        member: user.member.name,
      })

      if (response.data.success) {
        setSuccess("Book reserved successfully!")
        fetchBookDetails() // Refresh data
      } else {
        setError(response.data.error || "Failed to reserve book")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLoan = async () => {
    if (!book) return

    const memberId = prompt("Enter Member ID or Email:")
    if (!memberId) return

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await loansApi.create({
        book: book.name,
        member: memberId,
      })

      if (response.data.success) {
        setSuccess("Book loaned successfully!")
        fetchBookDetails() // Refresh data
      } else {
        setError(response.data.error || "Failed to create loan")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!currentLoan) return

    if (!confirm("Are you sure you want to mark this book as returned?")) {
      return
    }

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await loansApi.returnBook(currentLoan.name)

      if (response.data.success) {
        setSuccess("Book returned successfully!")
        fetchBookDetails() // Refresh data
      } else {
        setError(response.data.error || "Failed to return book")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Book not found</h3>
        <Link to="/books" className="text-blue-600 hover:text-blue-500">
          ← Back to Books
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link to="/books" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
          ← Back to Books
        </Link>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
              <p className="mt-1 text-lg text-gray-600">by {book.author}</p>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                book.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {book.is_available ? "✅ Available" : "❌ On Loan"}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {book.isbn && (
              <div>
                <dt className="text-sm font-medium text-gray-500">ISBN</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.isbn}</dd>
              </div>
            )}
            {book.publish_date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Publish Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.publish_date}</dd>
              </div>
            )}
            {book.category && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.category}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {book.is_available ? "Available for loan" : "Currently on loan"}
              </dd>
            </div>
            {reservationCount > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reservations</dt>
                <dd className="mt-1 text-sm text-gray-900">{reservationCount} people waiting</dd>
              </div>
            )}
            {book.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{book.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Current Loan Info */}
        {currentLoan && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Loan</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Member:</span>
                  <span className="ml-2 text-sm text-gray-900">{currentLoan.member}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                  <span className="ml-2 text-sm text-gray-900">{currentLoan.return_date}</span>
                </div>
                {isLibrarian && (
                  <div>
                    <button
                      onClick={handleReturn}
                      disabled={actionLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "Mark as Returned"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reservations Queue */}
        {isLibrarian && reservations.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Queue</h3>
            <div className="space-y-3">
              {reservations.map((reservation, index) => (
                <div key={reservation.name} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-900">#{index + 1}</span>
                      <span className="ml-2 text-sm text-gray-900">{reservation.member_name}</span>
                      <span className="ml-2 text-xs text-gray-500">({reservation.email})</span>
                    </div>
                    <div className="text-xs text-gray-500">Reserved: {reservation.reserve_date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex space-x-3">
            {book.is_available && isLibrarian && (
              <button
                onClick={handleLoan}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Create Loan"}
              </button>
            )}

            {!book.is_available && user?.user_type === "member" && (
              <button
                onClick={handleReserve}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Reserve Book"}
              </button>
            )}

            {isLibrarian && (
              <Link
                to={`/books/${book.name}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Book
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail
