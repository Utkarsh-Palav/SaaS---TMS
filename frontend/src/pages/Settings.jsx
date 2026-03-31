import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Menu,
  Bell,
  Settings as SettingsIcon,
  Loader2,
  Link as LinkIcon,
  UserCircle2,
  Building2,
  CreditCard,
  CalendarClock,
  CircleHelp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import RolesSettings from "@/components/Settings/RolesSettings";
import Sidebar from "@/components/Layout/Sidebar";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const safe = (value, fallback = "Not set") =>
  value === null || value === undefined || value === "" ? fallback : value;

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const API = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { user, login } = useAuth();
  const { toggleNotificationPanel, notifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profile, setProfile] = useState(user || null);
  const [integrationStatus, setIntegrationStatus] = useState({
    google: { connected: false },
    slack: { connected: false },
    github: { connected: false },
    zoom: { connected: false, available: false },
    teams: { connected: false, available: false },
  });

  const fetchProfile = async () => {
    const res = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
    setProfile(res.data.user);
    login(res.data.user);
  };

  const fetchIntegrationStatus = async () => {
    const res = await axios.get(`${API}/api/v1/integrations/status`, {
      withCredentials: true,
    });
    setIntegrationStatus(res.data);
  };

  const bootstrap = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchIntegrationStatus()]);
    } catch (error) {
      console.error("Failed to load settings data:", error);
      toast.error("Unable to load settings data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success) {
      if (success === "google_connected") toast.success("Google Calendar connected.");
      if (success === "slack_connected") toast.success("Slack connected.");
      if (success === "github_connected") toast.success("GitHub connected.");
      bootstrap();
      window.history.replaceState({}, document.title, "/settings");
    }

    if (error) {
      if (error === "google_oauth_failed") toast.error("Google OAuth failed.");
      if (error === "slack_oauth_failed") toast.error("Slack OAuth failed.");
      if (error === "github_oauth_failed") toast.error("GitHub OAuth failed.");
      window.history.replaceState({}, document.title, "/settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const organization = profile?.organizationId || {};
  const roleName = profile?.role?.name || "Unknown";
  const fullName = [profile?.firstName, profile?.middleName, profile?.lastName]
    .filter(Boolean)
    .join(" ");

  const startOAuth = async (provider) => {
    try {
      setIsConnecting(true);
      const res = await axios.get(`${API}/api/v1/integrations/${provider}/auth`, {
        withCredentials: true,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(`Could not start ${provider} OAuth.`);
      }
    } catch (error) {
      console.error(`Error starting ${provider} OAuth:`, error);
      toast.error(error?.response?.data?.message || `Could not connect ${provider}.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectIntegration = async (provider, label) => {
    try {
      setIsConnecting(true);
      await axios.delete(`${API}/api/v1/integrations/${provider}/disconnect`, {
        withCredentials: true,
      });
      toast.success(`${label} disconnected.`);
      await fetchIntegrationStatus();
      if (provider === "google") await fetchProfile();
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      toast.error(error?.response?.data?.message || `Could not disconnect ${label}.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const testIntegration = async (provider, label) => {
    try {
      setIsConnecting(true);
      await axios.post(
        `${API}/api/v1/integrations/${provider}/test`,
        {},
        { withCredentials: true }
      );
      toast.success(`${label} test succeeded.`);
    } catch (error) {
      console.error(`Error testing ${provider}:`, error);
      toast.error(error?.response?.data?.message || `${label} test failed.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const tabs = useMemo(() => {
    const base = [
      { key: "general", label: "General" },
      { key: "profile", label: "Profile" },
      { key: "notifications", label: "Notifications" },
      { key: "security", label: "Security" },
      { key: "billing", label: "Billing" },
      { key: "integrations", label: "Integrations" },
    ];
    if (roleName === "Boss") {
      base.push({ key: "roles", label: "Roles & permissions", icon: Shield });
    }
    return base;
  }, [roleName]);

  const connectedCount =
    (integrationStatus.google?.connected ? 1 : 0) +
    (integrationStatus.slack?.connected ? 1 : 0) +
    (integrationStatus.github?.connected ? 1 : 0);

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="text-primary" size={24} /> Settings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleNotificationPanel}
              className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
            >
              <Bell size={22} />
              {notifications?.length > 0 && (
                <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="h-[65vh] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading settings data...</p>
              </div>
            ) : (
              <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`${
                          activeTab === tab.key
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                        } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
                      >
                        {tab.icon ? <tab.icon className="shrink-0 -ml-1 mr-3 h-5 w-5" /> : null}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </aside>

                <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                  {activeTab === "general" && (
                    <Card title="Organization Details" icon={<Building2 className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Live data from your current organization profile.
                      </p>
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Company Name" value={safe(organization.name)} />
                        <InfoRow label="Country" value={safe(organization.country)} />
                        <InfoRow label="City" value={safe(organization.city)} />
                        <InfoRow label="State" value={safe(organization.state)} />
                        <InfoRow label="Address" value={safe(organization.address)} />
                        <InfoRow label="PIN Code" value={safe(organization.pincode)} />
                        <InfoRow label="Website" value={safe(organization.websiteUrl)} />
                        <InfoRow label="GSTIN" value={safe(organization.gstin)} />
                        <InfoRow label="Organization Created" value={formatDate(organization.createdAt)} />
                      </div>
                    </Card>
                  )}

                  {activeTab === "profile" && (
                    <Card title="Profile Information" icon={<UserCircle2 className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Live account data for the currently signed-in user.
                      </p>
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Full Name" value={safe(fullName)} />
                        <InfoRow label="Email" value={safe(profile?.email)} />
                        <InfoRow label="Phone" value={safe(profile?.contactNo)} />
                        <InfoRow label="Role" value={safe(roleName)} />
                        <InfoRow label="Job Title" value={safe(profile?.jobTitle)} />
                        <InfoRow label="Status" value={safe(profile?.status)} />
                        <InfoRow label="City" value={safe(profile?.city)} />
                        <InfoRow label="Country" value={safe(profile?.country)} />
                      </div>
                    </Card>
                  )}

                  {activeTab === "notifications" && (
                    <Card title="Notification Center" icon={<Bell className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Real-time notifications currently available in your account.
                      </p>
                      <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                        Total Notifications:{" "}
                        <span className="font-semibold">{notifications?.length || 0}</span>
                      </div>
                    </Card>
                  )}

                  {activeTab === "security" && (
                    <Card title="Security Overview" icon={<Shield className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current account security metadata from your live profile.
                      </p>
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Google OAuth" value={integrationStatus.google?.connected ? "Connected" : "Disconnected"} />
                        <InfoRow label="Slack OAuth" value={integrationStatus.slack?.connected ? "Connected" : "Disconnected"} />
                        <InfoRow label="GitHub OAuth" value={integrationStatus.github?.connected ? "Connected" : "Disconnected"} />
                        <InfoRow label="Last Profile Update" value={formatDate(profile?.updatedAt)} />
                      </div>
                    </Card>
                  )}

                  {activeTab === "billing" && (
                    <Card title="Billing & Plan" icon={<CreditCard className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Live subscription details from your organization profile.
                      </p>
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Plan" value={safe(organization.plan, "free")} />
                        <InfoRow label="Billing Cycle" value={safe(organization.planType, "monthly")} />
                        <InfoRow label="Subscription Expires" value={formatDate(organization.subscriptionExpiresAt)} />
                        <InfoRow label="Organization" value={safe(organization.name)} />
                      </div>
                    </Card>
                  )}

                  {activeTab === "integrations" && (
                    <Card title="Integrations" icon={<LinkIcon className="h-5 w-5 text-primary" />}>
                      <p className="mt-1 text-sm text-muted-foreground">
                        OAuth-based connect/disconnect flow across providers.
                      </p>
                      <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Connected Integrations: {connectedCount}
                      </div>

                      <div className="mt-5 space-y-4">
                        <IntegrationRow
                          name="Google Calendar"
                          description="Sync meetings with Google Calendar."
                          connected={integrationStatus.google?.connected}
                          isConnecting={isConnecting}
                          onConnect={() => startOAuth("google")}
                          onDisconnect={() => disconnectIntegration("google", "Google Calendar")}
                        />
                        <IntegrationRow
                          name="Slack"
                          description="Connect with Slack OAuth and send alerts to channels."
                          connected={integrationStatus.slack?.connected}
                          isConnecting={isConnecting}
                          onConnect={() => startOAuth("slack")}
                          onDisconnect={() => disconnectIntegration("slack", "Slack")}
                          onTest={() => testIntegration("slack", "Slack")}
                          helper="Slack admin approval may be required."
                        />
                        <IntegrationRow
                          name="GitHub"
                          description="Connect your GitHub identity for upcoming repo workflows."
                          connected={integrationStatus.github?.connected}
                          isConnecting={isConnecting}
                          onConnect={() => startOAuth("github")}
                          onDisconnect={() => disconnectIntegration("github", "GitHub")}
                          onTest={() => testIntegration("github", "GitHub")}
                        />
                        <IntegrationRow
                          name="Zoom"
                          description="OAuth connector scaffold is ready; activation coming soon."
                          connected={false}
                          isConnecting={false}
                          disabled
                        />
                        <IntegrationRow
                          name="Microsoft Teams"
                          description="OAuth connector scaffold is ready; activation coming soon."
                          connected={false}
                          isConnecting={false}
                          disabled
                        />
                      </div>
                    </Card>
                  )}

                  {activeTab === "roles" && roleName === "Boss" && (
                    <div className="shadow sm:rounded-md sm:overflow-hidden">
                      <div className="bg-card py-6 px-4 sm:p-6">
                        <RolesSettings />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

const Card = ({ title, icon, children }) => (
  <div className="shadow sm:rounded-lg sm:overflow-hidden border border-border bg-card p-6">
    <h2 className="text-lg font-medium flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const IntegrationRow = ({
  name,
  description,
  connected,
  isConnecting,
  onConnect,
  onDisconnect,
  onTest,
  helper,
  disabled = false,
}) => (
  <div className="bg-muted rounded-lg p-4 flex items-center justify-between gap-4">
    <div>
      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
        {name}
        {connected ? <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> : null}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {helper ? (
        <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
          <CircleHelp className="h-3.5 w-3.5" />
          {helper}
        </p>
      ) : null}
    </div>
    <div className="flex items-center gap-2">
      {disabled ? (
        <button
          disabled
          className="px-3 py-2 text-sm font-medium rounded-md border border-border text-muted-foreground cursor-not-allowed"
        >
          Coming soon
        </button>
      ) : connected ? (
        <>
          {onTest ? (
            <button
              onClick={onTest}
              disabled={isConnecting}
              className="px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              Test
            </button>
          ) : null}
          <button
            onClick={onDisconnect}
            disabled={isConnecting}
            className="px-3 py-2 text-sm font-medium rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
          >
            {isConnecting ? "Loading..." : "Disconnect"}
          </button>
        </>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          {isConnecting ? "Loading..." : "Connect"}
        </button>
      )}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-medium text-foreground break-words">{value}</p>
  </div>
);

export default Settings;
