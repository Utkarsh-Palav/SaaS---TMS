import React, { useState } from "react";
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  SaveIcon,
  BellDot,
  User,
  Shield,
} from "lucide-react";
import RolesSettings from "@/components/Settings/RolesSettings";
import Sidebar from "@/components/Layout/Sidebar";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import ProfileImage from "@/components/ui/ProfileImage";
import { useAuth } from "@/context/AuthContext";
const Settings = () => {
  const { user } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </button>
                <div className="ml-4 flex items-center lg:ml-0">
                  <h1 className="text-lg font-medium text-gray-900">
                    Settings
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={toggleNotificationPanel}
                  className="shrink-0 p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">View notifications</span>
                  {notifications && notifications.length > 0 ? (
                    <BellDot className="text-green-500" />
                  ) : (
                    <BellIcon className="text-gray-400" />
                  )}
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md hover:shadow-lg transition-shadow">
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <ProfileImage src={user.profileImage} />
                        ) : (
                          <User className="text-blue-600" size={20} />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
              {/* Sidebar Navigation */}
              <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`${
                      activeTab === "general"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`${
                      activeTab === "profile"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`${
                      activeTab === "notifications"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`${
                      activeTab === "security"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`${
                      activeTab === "billing"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Billing
                  </button>
                  <button
                    onClick={() => setActiveTab("integrations")}
                    className={`${
                      activeTab === "integrations"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                  >
                    <svg
                      className="shrink-0 -ml-1 mr-3 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                      />
                    </svg>
                    Integrations
                  </button>
                  {user?.role?.name === "Boss" && (
                    <button
                      onClick={() => setActiveTab("roles")}
                      className={`${
                        activeTab === "roles"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                      } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                    >
                      <Shield className="shrink-0 -ml-1 mr-3 h-6 w-6" />
                      Roles & permissions
                    </button>
                  )}
                </nav>
              </aside>
              {/* Main Content */}
              <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                {activeTab === "general" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          General Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your organization's general settings and
                          preferences.
                        </p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="company-name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Company Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="company-name"
                              id="company-name"
                              defaultValue="Tech Company Inc."
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-gray-700"
                          >
                            About
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="about"
                              name="about"
                              rows={3}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                              defaultValue="We are a technology company focused on innovation and excellence."
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Brief description about your organization.
                          </p>
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="timezone"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Timezone
                          </label>
                          <select
                            id="timezone"
                            name="timezone"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option>Pacific Standard Time (PST)</option>
                            <option>Eastern Standard Time (EST)</option>
                            <option>Central Standard Time (CST)</option>
                            <option>Mountain Standard Time (MST)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="language"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Language
                          </label>
                          <select
                            id="language"
                            name="language"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "profile" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Profile Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Update your personal profile information.
                        </p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="first-name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            First name
                          </label>
                          <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            defaultValue="John"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="last-name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Last name
                          </label>
                          <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            defaultValue="Doe"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            defaultValue="john.doe@example.com"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Phone number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue="+1 (555) 123-4567"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Role
                          </label>
                          <input
                            type="text"
                            name="role"
                            id="role"
                            defaultValue="Administrator"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "notifications" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Notification Preferences
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Choose how you want to be notified about updates.
                        </p>
                      </div>
                      <fieldset>
                        <legend className="text-base font-medium text-gray-900">
                          Email Notifications
                        </legend>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="task-updates"
                                name="task-updates"
                                type="checkbox"
                                defaultChecked
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="task-updates"
                                className="font-medium text-gray-700"
                              >
                                Task Updates
                              </label>
                              <p className="text-gray-500">
                                Get notified when tasks are assigned or updated.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="meeting-reminders"
                                name="meeting-reminders"
                                type="checkbox"
                                defaultChecked
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="meeting-reminders"
                                className="font-medium text-gray-700"
                              >
                                Meeting Reminders
                              </label>
                              <p className="text-gray-500">
                                Receive reminders for upcoming meetings.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="messages"
                                name="messages"
                                type="checkbox"
                                defaultChecked
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="messages"
                                className="font-medium text-gray-700"
                              >
                                Messages
                              </label>
                              <p className="text-gray-500">
                                Get notified about new messages.
                              </p>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "security" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Security Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your account security and authentication.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="current-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="current-password"
                            id="current-password"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            name="new-password"
                            id="new-password"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="two-factor"
                              name="two-factor"
                              type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="two-factor"
                              className="font-medium text-gray-700"
                            >
                              Enable Two-Factor Authentication
                            </label>
                            <p className="text-gray-500">
                              Add an extra layer of security to your account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "billing" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Billing Information
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your subscription and payment methods.
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg
                              className="h-5 w-5 text-blue-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                              Current Plan: Professional
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                $29/month per user • Next billing date: January
                                1, 2024
                              </p>
                            </div>
                            <div className="mt-4">
                              <button className="text-sm font-medium text-blue-800 hover:text-blue-700">
                                Upgrade Plan →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Payment Method
                        </h3>
                        <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                Visa ending in 4242
                              </p>
                              <p className="text-sm text-gray-500">
                                Expires 12/2024
                              </p>
                            </div>
                          </div>
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "roles" && user?.role?.name === "Boss" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <RolesSettings />
                    </div>
                  </div>
                )}
                {activeTab === "integrations" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Integrations
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Connect WorkSpace with your favorite tools.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            name: "Slack",
                            description: "Connect your Slack workspace",
                            connected: true,
                          },
                          {
                            name: "Google Calendar",
                            description: "Sync your meetings and events",
                            connected: true,
                          },
                          {
                            name: "GitHub",
                            description: "Link your repositories",
                            connected: false,
                          },
                          {
                            name: "Zoom",
                            description: "Enable video conferencing",
                            connected: false,
                          },
                        ].map((integration) => (
                          <div
                            key={integration.name}
                            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {integration.description}
                              </p>
                            </div>
                            <button
                              className={`px-4 py-2 text-sm font-medium rounded-md ${
                                integration.connected
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {integration.connected ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};
export default Settings;
