import React, { useState } from 'react'
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  BellDot,
  User,
  Menu,
  Bell,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Sidebar from '@/components/Layout/Sidebar'
import { useNotifications } from '@/context/NotificationContext'
import NotificationPanel from '@/components/Dashboard/NotificationPanel'
import ProfileImage from '@/components/ui/ProfileImage'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
const Reports = () => {
  const { user } = useAuth();

  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const taskCompletionData = [
    {
      name: 'Jan',
      completed: 45,
      pending: 23,
      overdue: 8,
    },
    {
      name: 'Feb',
      completed: 52,
      pending: 19,
      overdue: 6,
    },
    {
      name: 'Mar',
      completed: 48,
      pending: 25,
      overdue: 10,
    },
    {
      name: 'Apr',
      completed: 61,
      pending: 18,
      overdue: 5,
    },
    {
      name: 'May',
      completed: 55,
      pending: 22,
      overdue: 7,
    },
    {
      name: 'Jun',
      completed: 67,
      pending: 15,
      overdue: 4,
    },
  ]
  const employeePerformanceData = [
    {
      name: 'Engineering',
      performance: 92,
    },
    {
      name: 'Marketing',
      performance: 88,
    },
    {
      name: 'Sales',
      performance: 95,
    },
    {
      name: 'HR',
      performance: 85,
    },
    {
      name: 'Finance',
      performance: 90,
    },
    {
      name: 'Design',
      performance: 93,
    },
  ]
  const departmentDistribution = [
    {
      name: 'Engineering',
      value: 42,
      color: '#4F46E5',
    },
    {
      name: 'Marketing',
      value: 21,
      color: '#10B981',
    },
    {
      name: 'Sales',
      value: 25,
      color: '#F59E0B',
    },
    {
      name: 'HR',
      value: 12,
      color: '#EC4899',
    },
    {
      name: 'Finance',
      value: 16,
      color: '#6366F1',
    },
    {
      name: 'Design',
      value: 12,
      color: '#8B5CF6',
    },
  ]
  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                 <BarChart3 className="text-primary" size={24} /> Reports
              </h1>
           </div>
           <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={toggleNotificationPanel} className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                 <Bell size={22} />
                 {notifications?.length > 0 && <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>}
              </button>
           </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Reports & Analytics
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm border-border rounded-lg bg-card text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0 bg-blue-500/10 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Tasks Completed
                      </dt>
                      <dd className="text-lg font-medium text-foreground">348</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-muted px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-600">+12%</span>
                  <span className="text-muted-foreground ml-2">from last period</span>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0 bg-green-500/10 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Active Employees
                      </dt>
                      <dd className="text-lg font-medium text-foreground">128</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-muted px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-600">+8%</span>
                  <span className="text-muted-foreground ml-2">from last period</span>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0 bg-yellow-500/10 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Meetings Held
                      </dt>
                      <dd className="text-lg font-medium text-foreground">87</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-muted px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-600">+5%</span>
                  <span className="text-muted-foreground ml-2">from last period</span>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0 bg-purple-500/10 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">
                        Departments
                      </dt>
                      <dd className="text-lg font-medium text-foreground">6</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-muted px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-600">No change</span>
                  <span className="text-muted-foreground ml-2">from last period</span>
                </div>
              </div>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
            {/* Task Completion Trend */}
            <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-medium text-foreground">
                  Task Completion Trend
                </h2>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        fill="#10B981"
                        name="Completed"
                      />
                      <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                      <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Department Performance */}
            <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-medium text-foreground">
                  Department Performance
                </h2>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeePerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar
                        dataKey="performance"
                        fill="#4F46E5"
                        name="Performance %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          {/* Department Distribution and Recent Activity */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-medium text-foreground">
                    Employee Distribution
                  </h2>
                </div>
                <div className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {departmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-medium text-foreground">
                    Top Performers
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {[
                    {
                      name: 'Jane Cooper',
                      department: 'Engineering',
                      tasks: 45,
                      avatar:
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                    },
                    {
                      name: 'Robert Wilson',
                      department: 'Sales',
                      tasks: 42,
                      avatar:
                        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                    },
                    {
                      name: 'Sarah Davis',
                      department: 'Marketing',
                      tasks: 38,
                      avatar:
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                    },
                    {
                      name: 'Michael Chen',
                      department: 'Engineering',
                      tasks: 36,
                      avatar:
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                    },
                    {
                      name: 'Emily Thompson',
                      department: 'HR',
                      tasks: 34,
                      avatar:
                        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                    },
                  ].map((performer, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <img
                          src={performer.avatar}
                          alt={performer.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-foreground">
                            {performer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {performer.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {performer.tasks} tasks
                        </p>
                        <p className="text-sm text-muted-foreground">completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  )
}
export default Reports
