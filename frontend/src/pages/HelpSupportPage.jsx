import React, { useState } from "react";
import {
  BellIcon,
  SearchIcon,
  UserIcon,
  MessageCircleIcon,
  BookOpenIcon,
  VideoIcon,
  MailIcon,
  PhoneIcon,
  BellDot,
  User,
  Menu,
  Bell,
  HelpCircle,
} from "lucide-react";
import Sidebar from "@/components/Layout/Sidebar";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useNotifications } from "@/context/NotificationContext";
import ProfileImage from "@/components/ui/ProfileImage";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
const HelpSupportPage = () => {
  const { user } = useAuth();

  const { toggleNotificationPanel, notifications } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
              <HelpCircle className="text-primary" size={24} /> Help & Support
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
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="Search for help articles, guides, or FAQs..."
              />
            </div>
          </div>
          {/* Quick Actions */}
          <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">
              How can we help you?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground">
                  Documentation
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse our comprehensive guides and tutorials
                </p>
              </button>
              <button className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
                  <VideoIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground">
                  Video Tutorials
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Watch step-by-step video guides
                </p>
              </button>
              <button className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
                  <MessageCircleIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground">Live Chat</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chat with our support team
                </p>
              </button>
              <button className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 mb-4">
                  <MailIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-foreground">
                  Email Support
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send us a detailed message
                </p>
              </button>
            </div>
          </div>
          {/* Popular Articles */}
          <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Popular Articles
            </h2>
            <div className="bg-card shadow rounded-lg border border-border divide-y divide-border">
              {[
                {
                  title: "Getting Started with WorkSpace",
                  category: "Getting Started",
                  views: 1234,
                },
                {
                  title: "How to Create and Manage Tasks",
                  category: "Tasks",
                  views: 987,
                },
                {
                  title: "Setting Up Your Team",
                  category: "Teams",
                  views: 856,
                },
                {
                  title: "Managing Departments and Employees",
                  category: "Organization",
                  views: 743,
                },
                {
                  title: "Scheduling and Managing Meetings",
                  category: "Meetings",
                  views: 621,
                },
                {
                  title: "Using the Messaging System",
                  category: "Communication",
                  views: 589,
                },
              ].map((article, idx) => (
                <button
                  key={idx}
                  className="w-full px-6 py-4 hover:bg-accent text-left flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.category}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {article.views}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* FAQs */}
          <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <div className="bg-card shadow rounded-lg border border-border divide-y divide-border">
              {[
                {
                  question: "How do I add new team members?",
                  answer:
                    'Navigate to the Employees page and click the "Add Employee" button. Fill in the required information and assign them to the appropriate department.',
                },
                {
                  question: "Can I customize my dashboard?",
                  answer:
                    "Yes, you can customize your dashboard by clicking on the Settings icon and selecting Dashboard Preferences. You can choose which widgets to display and their arrangement.",
                },
                {
                  question: "How do I export reports?",
                  answer:
                    'Go to the Reports page, select your desired filters and date range, then click the "Export Report" button in the top right corner. You can export in PDF, Excel, or CSV formats.',
                },
                {
                  question: "What are the different subscription plans?",
                  answer:
                    "We offer three plans: Starter ($12/user/month), Professional ($29/user/month), and Enterprise ($79/user/month). Visit our Pricing page for detailed feature comparisons.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="px-6 py-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Contact Support */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-primary">
                    Still need help?
                  </h3>
                  <div className="mt-2 text-sm text-foreground">
                    <p>Our support team is available 24/7 to assist you.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                      <MessageCircleIcon className="h-4 w-4 mr-2" />
                      Start Live Chat
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent transition-colors">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Email Support
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Call Us
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};
export default HelpSupportPage;
