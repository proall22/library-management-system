"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { reportsApi } from "../services/api"
import type { LibraryStats } from "../types"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await reportsApi.getLibraryStats()
      if (response.data.success && response.data.data) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const isLibrarian = user?.roles.includes("Librarian") || user?.roles.includes("System Manager")

  const quickActions = [
    {
      title: "Browse Books",
      description: "Search and view available books",
      href: "/books",
      icon: "📚",
      color: "bg-blue-500",
    },
    ...(isLibrarian
      ? [
          {
            title: "Manage Members",
            description: "Add and manage library members",
            href: "/members",
            icon: "👥",
            color: "bg-green-500",
          },
          {
            title: "Process Loans",
            description: "Create and manage book loans",
            href: "/loans",
            icon: "📖",
            color: "bg-purple-500",
          },
        ]
      : []),
    {
      title: "My Reservations",
      description: "View and manage your reservations",
      href: "/reservations",
      icon: "📋",
      color: "bg-orange-500",
    },
    ...(isLibrarian
      ? [
          {
            title: "Reports",
            description: "View library reports and analytics",
            href: "/reports",
            icon: "📈",
            color: "bg-red-500",
          },
        ]
      : []),
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}! 👋</h1>
        <p className="mt-2 text-gray-600">Here's what's happening in your library today.</p>
      </div>

      {/* Stats Grid */}
      {stats && isLibrarian && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📚</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total_books}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                    <dd className="text-lg font-medium text-green-600">{stats.available_books}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📖</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">On Loan</dt>
                    <dd className="text-lg font-medium text-blue-600">{stats.active_loans}</dd>
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
                    <dd className="text-lg font-medium text-red-600">{stats.overdue_loans}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${action.color} rounded-md p-3`}>
                    <div className="text-white text-xl">{action.icon}</div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>Activity tracking coming soon...</p>
            <p className="text-sm mt-2">This section will show recent loans, returns, and reservations.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
