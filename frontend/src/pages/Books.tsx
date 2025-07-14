"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { booksApi, reservationsApi } from "../services/api"
import type { Book } from "../types"

interface BookFormData {
  title: string
  author: string
  isbn: string
  publish_date: string
  description: string
  category: string
}

const Books: React.FC = () => {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    publish_date: "",
    description: "",
    category: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await booksApi.getAll({ limit: 100 })
      if (response.data.success && response.data.data) {
        setBooks(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks()
      return
    }

    try {
      const response = await booksApi.search(searchQuery, 50)
      if (response.data.success && response.data.data) {
        setBooks(response.data.data)
      }
    } catch (error) {
      console.error("Error searching books:", error)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError("")
    setSuccess("")

    try {
      if (editingBook) {
        const response = await booksApi.update(editingBook.name, formData)
        if (response.data.success) {
          setSuccess("Book updated successfully!")
          setEditingBook(null)
        } else {
          setError(response.data.error || "Failed to update book")
        }
      } else {
        const response = await booksApi.create(formData)
        if (response.data.success) {
          setSuccess("Book created successfully!")
          setShowAddForm(false)
        } else {
          setError(response.data.error || "Failed to create book")
        }
      }

      resetForm()
      fetchBooks()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      publish_date: book.publish_date || "",
      description: book.description || "",
      category: book.category || "",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (book: Book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return
    }

    try {
      const response = await booksApi.delete(book.name)
      if (response.data.success) {
        setSuccess("Book deleted successfully!")
        fetchBooks()
      } else {
        setError(response.data.error || "Failed to delete book")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const handleReserve = async (book: Book) => {
    if (!user?.member) {
      setError("Member profile not found")
      return
    }

    try {
      const response = await reservationsApi.create({
        book: book.name,
        member: user.member.name,
      })

      if (response.data.success) {
        setSuccess("Book reserved successfully!")
      } else {
        setError(response.data.error || "Failed to reserve book")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      publish_date: "",
      description: "",
      category: "",
    })
    setShowAddForm(false)
    setEditingBook(null)
    setError("")
    setSuccess("")
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.category && book.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
          <p className="mt-2 text-sm text-gray-700">Browse and manage the library's book collection.</p>
        </div>
        {isLibrarian && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Book
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search books by title, author, or category..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{editingBook ? "Edit Book" : "Add New Book"}</h3>
          </div>
          <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {formLoading ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    book.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.is_available ? "Available" : "On Loan"}
                </div>
                {book.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {book.category}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

              {book.description && <p className="text-sm text-gray-500 mb-4 line-clamp-3">{book.description}</p>}

              <div className="flex items-center justify-between">
                <Link to={`/books/${book.name}`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  View Details
                </Link>

                <div className="flex space-x-2">
                  {!book.is_available && user?.user_type === "member" && (
                    <button
                      onClick={() => handleReserve(book)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                    >
                      Reserve
                    </button>
                  )}

                  {isLibrarian && (
                    <>
                      <button
                        onClick={() => handleEdit(book)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search terms." : "No books have been added yet."}
          </p>
        </div>
      )}
    </div>
  )
}

export default Books
