export interface Book {
  name: string
  title: string
  author: string
  isbn?: string
  publish_date?: string
  is_available: boolean
  description?: string
  category?: string
}

export interface Member {
  name: string
  name1: string
  membership_id: string
  email: string
  phone?: string
  address?: string
  join_date: string
  status: "Active" | "Inactive" | "Suspended"
}

export interface Loan {
  name: string
  book: string
  member: string
  loan_date: string
  return_date: string
  actual_return_date?: string
  returned: boolean
  fine_amount?: number
  notes?: string
}

export interface Reservation {
  name: string
  book: string
  member: string
  reserve_date: string
  status: "Pending" | "Ready" | "Fulfilled" | "Cancelled" | "Expired"
  expiry_date?: string
  notes?: string
}

export interface User {
  name: string
  full_name: string
  email: string
  roles: string[]
  user_type: "admin" | "librarian" | "member"
  member?: Member
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
}

export interface LibraryStats {
  total_books: number
  available_books: number
  books_on_loan: number
  total_members: number
  active_members: number
  total_loans: number
  active_loans: number
  overdue_loans: number
  pending_reservations: number
  ready_reservations: number
}
