import React, { useState } from "react";
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  SaveIcon,
  BellDot,
  User,
  Shield,
  Menu,
  Bell,
  Settings as SettingsIcon,
} from "lucide-react";
import RolesSettings from "@/components/Settings/RolesSettings";
import Sidebar from "@/components/Layout/Sidebar";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import ProfileImage from "@/components/ui/ProfileImage";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import axios from "axios";

const Settings = () => {
  const { user, login } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("integrations"); // Default set to integrations for testing
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/integrations/google/auth`, { withCredentials: true });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Error connecting Google Calendar:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/integrations/google/disconnect`, { withCredentials: true });
      window.location.reload(); // Quick refresh to update the token state natively
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
    } finally {
      setIsConnecting(false);
    }
  };
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
              <SettingsIcon className="text-primary" size={24} /> Settings
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
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
                  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border">
                    <div className="bg-card py-6 px-4 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          General Settings
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Manage your organization's general settings and
                          preferences.
                        </p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="company-name"
                            className="block text-sm font-medium text-foreground"
                          >
                            Company Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="company-name"
                              id="company-name"
                              defaultValue="Tech Company Inc."
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-lg bg-background text-foreground"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-foreground"
                          >
                            About
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="about"
                              name="about"
                              rows={3}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-border rounded-md bg-background text-foreground"
                              defaultValue="We are a technology company focused on innovation and excellence."
                            />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Brief description about your organization.
                          </p>
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="timezone"
                            className="block text-sm font-medium text-foreground"
                          >
                            Timezone
                          </label>
                          <select
                            id="timezone"
                            name="timezone"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
                            className="block text-sm font-medium text-foreground"
                          >
                            Language
                          </label>
                          <select
                            id="language"
                            name="language"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-muted text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "profile" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-card py-6 px-4 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          Profile Information
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Update your personal profile information.
                        </p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="first-name"
                            className="block text-sm font-medium text-foreground"
                          >
                            First name
                          </label>
                          <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            defaultValue="John"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="last-name"
                            className="block text-sm font-medium text-foreground"
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
                            className="block text-sm font-medium text-foreground"
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
                            className="block text-sm font-medium text-foreground"
                          >
                            Phone number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue="+1 (555) 123-4567"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="role"
                            className="block text-sm font-medium text-foreground"
                          >
                            Role
                          </label>
                          <input
                            type="text"
                            name="role"
                            id="role"
                            defaultValue="Administrator"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-muted text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "notifications" && (
                  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border">
                    <div className="bg-card py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          Notification Preferences
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Choose how you want to be notified about updates.
                        </p>
                      </div>
                      <fieldset>
                        <legend className="text-base font-medium text-foreground">
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
                                className="focus:ring-primary h-4 w-4 text-primary border-border rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="task-updates"
                                className="font-medium text-foreground"
                              >
                                Task Updates
                              </label>
                              <p className="text-muted-foreground">
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
                                className="font-medium text-foreground"
                              >
                                Meeting Reminders
                              </label>
                              <p className="text-muted-foreground">
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
                                className="font-medium text-foreground"
                              >
                                Messages
                              </label>
                              <p className="text-muted-foreground">
                                Get notified about new messages.
                              </p>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    <div className="px-4 py-3 bg-muted text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "security" && (
                  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border">
                    <div className="bg-card py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          Security Settings
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Manage your account security and authentication.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="current-password"
                            className="block text-sm font-medium text-foreground"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="current-password"
                            id="current-password"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-foreground"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            name="new-password"
                            id="new-password"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-foreground"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-border bg-background text-foreground rounded-md"
                          />
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="two-factor"
                              name="two-factor"
                              type="checkbox"
                              className="focus:ring-primary h-4 w-4 text-primary border-border rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="two-factor"
                              className="font-medium text-foreground"
                            >
                              Enable Two-Factor Authentication
                            </label>
                            <p className="text-muted-foreground">
                              Add an extra layer of security to your account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-muted text-right sm:px-6">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "billing" && (
                  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border">
                    <div className="bg-card py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          Billing Information
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Manage your subscription and payment methods.
                        </p>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg
                              className="h-5 w-5 text-primary"
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
                            <h3 className="text-sm font-medium text-primary">
                              Current Plan: Professional
                            </h3>
                            <div className="mt-2 text-sm text-foreground">
                              <p>
                                $29/month per user • Next billing date: January
                                1, 2024
                              </p>
                            </div>
                            <div className="mt-4">
                              <button className="text-sm font-medium text-primary hover:text-primary/80">
                                Upgrade Plan →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">
                          Payment Method
                        </h3>
                        <div className="mt-4 bg-muted rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              className="h-8 w-8 text-muted-foreground"
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
                              <p className="text-sm font-medium text-foreground">
                                Visa ending in 4242
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Expires 12/2024
                              </p>
                            </div>
                          </div>
                          <button className="text-sm font-medium text-primary hover:text-primary/80">
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "roles" && user?.role?.name === "Boss" && (
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-card py-6 px-4 sm:p-6">
                      <RolesSettings />
                    </div>
                  </div>
                )}
                {activeTab === "integrations" && (
                  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border">
                    <div className="bg-card py-6 px-4 space-y-6 sm:p-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-foreground">
                          Integrations
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Connect WorkSpace with your favorite tools.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            name: "Slack",
                            id: "slack",
                            description: "Connect your Slack workspace",
                            connected: false,
                          },
                          {
                            name: "Google Calendar",
                            id: "google",
                            description: "Sync your meetings and events directly with our internal calendar",
                            connected: !!user?.googleTokens,
                            onConnect: handleConnectGoogle,
                            onDisconnect: handleDisconnectGoogle
                          },
                          {
                            name: "GitHub",
                            id: "github",
                            description: "Link your repositories",
                            connected: false,
                          },
                          {
                            name: "Zoom",
                            id: "zoom",
                            description: "Enable video conferencing",
                            connected: false,
                          },
                        ].map((integration) => (
                          <div
                            key={integration.name}
                            className="bg-muted rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                {integration.name}
                                {integration.connected && (
                                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {integration.description}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (integration.connected && integration.onDisconnect) integration.onDisconnect();
                                else if (!integration.connected && integration.onConnect) integration.onConnect();
                              }}
                              disabled={isConnecting}
                              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                integration.connected
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              } disabled:opacity-50`}
                            >
                              {isConnecting && integration.id === 'google' ? "Loading..." : integration.connected ? "Disconnect" : "Connect"}
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
