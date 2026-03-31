import { lazy, Suspense } from "react"; // 👈 Import hooks
import { Route, Routes } from "react-router-dom"; // 👈 Import useLocation
import ProtectedRoute from "./routes/ProtectedRoutes";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Toaster as HotToast } from "react-hot-toast";
import Pricing from "./pages/Pricing";
import ProtectRegRoute from "./routes/ProtectRegRoute";
import LandingPage from "./pages/LandingPage";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Tasks from "./pages/Tasks";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Chat from "./pages/Chat";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Meeting from "./pages/Meeting";
import HelpSupportPage from "./pages/HelpSupportPage";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Product from "./pages/Product";
import Solutions from "./pages/Solutions";
import { CancellationRefund, Privacy, ShippingPolicy, Terms } from "./pages/Legal";
import Changelog from "./pages/Changelog";
import Integrations from "./pages/Integrations";
import Contact from "./pages/Contact";
import Status from "./pages/Status";
import Careers from "./pages/Careers";
import PageLoader from "./components/ui/PageLoader";
import Home from "./pages/Home";

// Lazy load the pages... (keep all your lazy imports here)

const TaskDetails = lazy(() => import("./pages/TaskDetails"));
const EmpDetails = lazy(() => import("./pages/EmpDetails"));
const DepartmentDetails = lazy(() => import("./pages/DeptDetails"));
const MeetingDetails = lazy(() => import("./pages/MeetingDetails"));

function App() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <>
      {/* These toasts should be outside the smooth-wrapper to prevent fixed/absolute positioning issues */}
      <Toaster richColors position="top-right" />
      <HotToast position="top-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* All your routes remain the same */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/registration"
            element={
              <ProtectRegRoute>
                <Registration />
              </ProtectRegRoute>
            }
          />
          <Route path="/plans" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/status" element={<Status />} />
          <Route path="/careers" element={<Careers />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmpDetails />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/department/:id" element={<DepartmentDetails />} />
            <Route path="/meetings" element={<Meeting />} />
            <Route path="/meetings/:id" element={<MeetingDetails />} />
            <Route path="/messages" element={<Chat />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
