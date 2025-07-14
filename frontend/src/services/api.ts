import axios, { type AxiosResponse } from "axios"
import type { ApiResponse, Book, Member, Loan, Reservation, User, LibraryStats } from "../types"

const API_BASE = "/api/method/library_app.api"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.post("/auth.login", { usr: email, pwd: password }),

  logout: (): Promise<AxiosResponse<ApiResponse<null>>> => api.post("/auth.logout"),

  register: (data: {
    full_name: string
    email: string
    password: string
    phone?: string
  }): Promise<AxiosResponse<ApiResponse<{ membership_id: string; email: string }>>> =>
    api.post("/auth.register_member", data),

  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> => api.get("/auth.get_current_user"),

  changePassword: (oldPassword: string, newPassword: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth.change_password", { old_password: oldPassword, new_password: newPassword }),
}

// Books API
export const booksApi = {
  getAll: (params?: {
    filters?: any
    limit?: number
    start?: number
  }): Promise<AxiosResponse<ApiResponse<Book[]>>> => api.get("/book.get_all_books", { params }),

  getById: (
    id: string,
  ): Promise<
    AxiosResponse<
      ApiResponse<{
        book: Book
        current_loan?: any
        reservation_count: number
      }>
    >
  > => api.get("/book.get_book", { params: { book_id: id } }),

  create: (data: Partial<Book>): Promise<AxiosResponse<ApiResponse<Book>>> => api.post("/book.create_book", data),

  update: (id: string, data: Partial<Book>): Promise<AxiosResponse<ApiResponse<Book>>> =>
    api.post("/book.update_book", { book_id: id, ...data }),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> => api.post("/book.delete_book", { book_id: id }),

  search: (query: string, limit?: number): Promise<AxiosResponse<ApiResponse<Book[]>>> =>
    api.get("/book.search_books", { params: { query, limit } }),
}

// Members API
export const membersApi = {
  getAll: (params?: {
    filters?: any
    limit?: number
    start?: number
  }): Promise<AxiosResponse<ApiResponse<Member[]>>> => api.get("/member.get_all_members", { params }),

  getById: (
    id: string,
  ): Promise<
    AxiosResponse<
      ApiResponse<{
        member: Member
        active_loans: any[]
        loan_history: any[]
        reservations: any[]
      }>
    >
  > => api.get("/member.get_member", { params: { member_id: id } }),

  create: (data: Partial<Member>): Promise<AxiosResponse<ApiResponse<Member>>> =>
    api.post("/member.create_member", data),

  update: (id: string, data: Partial<Member>): Promise<AxiosResponse<ApiResponse<Member>>> =>
    api.post("/member.update_member", { member_id: id, ...data }),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/member.delete_member", { member_id: id }),

  search: (query: string, limit?: number): Promise<AxiosResponse<ApiResponse<Member[]>>> =>
    api.get("/member.search_members", { params: { query, limit } }),
}

// Loans API
export const loansApi = {
  getAll: (params?: {
    filters?: any
    limit?: number
    start?: number
  }): Promise<AxiosResponse<ApiResponse<Loan[]>>> => api.get("/loan.get_all_loans", { params }),

  create: (data: {
    book: string
    member: string
    return_date?: string
  }): Promise<AxiosResponse<ApiResponse<Loan>>> => api.post("/loan.create_loan", data),

  returnBook: (loanId: string, actualReturnDate?: string): Promise<AxiosResponse<ApiResponse<Loan>>> =>
    api.post("/loan.return_book", { loan_id: loanId, actual_return_date: actualReturnDate }),

  getActive: (): Promise<AxiosResponse<ApiResponse<any[]>>> => api.get("/loan.get_active_loans"),

  getOverdue: (): Promise<AxiosResponse<ApiResponse<any[]>>> => api.get("/loan.get_overdue_loans"),

  extend: (loanId: string, newReturnDate: string): Promise<AxiosResponse<ApiResponse<Loan>>> =>
    api.post("/loan.extend_loan", { loan_id: loanId, new_return_date: newReturnDate }),
}

// Reservations API
export const reservationsApi = {
  create: (data: {
    book: string
    member: string
  }): Promise<AxiosResponse<ApiResponse<Reservation>>> => api.post("/reservation.create_reservation", data),

  getMemberReservations: (memberId: string): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get("/reservation.get_member_reservations", { params: { member: memberId } }),

  cancel: (reservationId: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/reservation.cancel_reservation", { reservation_id: reservationId }),

  getBookReservations: (bookId: string): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get("/reservation.get_book_reservations", { params: { book: bookId } }),
}

// Reports API
export const reportsApi = {
  getActiveLoans: (): Promise<
    AxiosResponse<
      ApiResponse<{
        loans: any[]
        statistics: any
      }>
    >
  > => api.get("/reports.get_active_loans_report"),

  getOverdueBooks: (): Promise<
    AxiosResponse<
      ApiResponse<{
        overdue_loans: any[]
        statistics: any
      }>
    >
  > => api.get("/reports.get_overdue_books_report"),

  getPopularBooks: (limit?: number): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get("/reports.get_popular_books_report", { params: { limit } }),

  getMemberActivity: (limit?: number): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get("/reports.get_member_activity_report", { params: { limit } }),

  getLibraryStats: (): Promise<AxiosResponse<ApiResponse<LibraryStats>>> => api.get("/reports.get_library_statistics"),
}
