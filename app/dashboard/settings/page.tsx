"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Save, User, Bell, Shield, CreditCard, Sun, Moon, Monitor } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useTheme } from "next-themes";

type NotificationPreferences = {
    emailNotifications: boolean;
    highRiskAlerts: boolean;
    weeklyReports: boolean;
    timezone: string;
    lastWeeklyReportSentAt: string | null;
};

export default function SettingsPage() {
    const { data: session } = authClient.useSession();
    const { theme, setTheme } = useTheme();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [highRiskAlerts, setHighRiskAlerts] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [preferencesError, setPreferencesError] = useState<string | null>(null);
    const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(null);
    const [lastWeeklyReportSentAt, setLastWeeklyReportSentAt] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadPreferences = async () => {
            setIsLoadingPreferences(true);
            setPreferencesError(null);

            try {
                const response = await fetch("/api/settings/notification-preferences", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const data = (await response.json()) as {
                    error?: string;
                    preferences?: NotificationPreferences;
                };

                if (!response.ok || !data.preferences) {
                    throw new Error(data.error || "Failed to load notification preferences.");
                }

                if (!cancelled) {
                    setEmailNotifications(data.preferences.emailNotifications);
                    setHighRiskAlerts(data.preferences.highRiskAlerts);
                    setWeeklyReports(data.preferences.weeklyReports);
                    setLastWeeklyReportSentAt(data.preferences.lastWeeklyReportSentAt);
                }
            } catch (error) {
                if (!cancelled) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Failed to load notification preferences.";
                    setPreferencesError(message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingPreferences(false);
                }
            }
        };

        void loadPreferences();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSavePreferences = async () => {
        setPreferencesError(null);
        setPreferencesSuccess(null);
        setIsSavingPreferences(true);

        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Sydney";
            const response = await fetch("/api/settings/notification-preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailNotifications,
                    highRiskAlerts,
                    weeklyReports,
                    timezone,
                }),
            });

            const data = (await response.json()) as {
                error?: string;
                preferences?: NotificationPreferences;
            };

            if (!response.ok || !data.preferences) {
                throw new Error(data.error || "Failed to save preferences.");
            }

            setEmailNotifications(data.preferences.emailNotifications);
            setHighRiskAlerts(data.preferences.highRiskAlerts);
            setWeeklyReports(data.preferences.weeklyReports);
            setLastWeeklyReportSentAt(data.preferences.lastWeeklyReportSentAt);
            setPreferencesSuccess("Preferences saved.");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to save preferences.";
            setPreferencesError(message);
        } finally {
            setIsSavingPreferences(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account preferences, billing, and notification settings.
                </p>
            </div>

            {/* Billing Settings */}
            <Panel className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Billing & Plan</h3>
                </div>
                <div className="rounded-[var(--radius)] border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Plan details and usage metrics will appear once billing is configured.
                </div>
            </Panel>

            {/* Profile Settings */}
                <Panel className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Profile</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    defaultValue={session?.user?.name?.split(" ")[0] || ""}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    defaultValue={session?.user?.name?.split(" ").slice(1).join(" ") || ""}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={session?.user?.email || ""}
                                    disabled
                                    className="mt-2"
                                />
                            <p className="text-xs text-muted-foreground mt-1">
                                Email cannot be changed here. Use your account provider settings.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="specialty">Specialty</Label>
                            <Input
                                id="specialty"
                                placeholder="e.g., Clinical Psychology"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="license">License Number</Label>
                            <Input
                                id="license"
                                placeholder="Enter your license number"
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <Button className="mt-6">
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                    </Button>
                </Panel>

                {/* Appearance */}
                <Panel className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Sun className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Appearance</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                            className="gap-2"
                        >
                            <Sun className="h-4 w-4" />
                            Light
                        </Button>
                        <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                            className="gap-2"
                        >
                            <Moon className="h-4 w-4" />
                            Dark
                        </Button>
                        <Button
                            variant={theme === "system" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("system")}
                            className="gap-2"
                        >
                            <Monitor className="h-4 w-4" />
                            System
                        </Button>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Choose a light or dark interface. System sync follows your device setting.
                    </p>
                </Panel>

                {/* Notification Settings */}
                <Panel className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Bell className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium">Email Notifications</div>
                                <p className="text-sm text-muted-foreground">Receive email updates about your patients</p>
                            </div>
                            <Button
                                variant={emailNotifications ? "default" : "outline"}
                                size="sm"
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                disabled={isLoadingPreferences || isSavingPreferences}
                            >
                                {emailNotifications ? "On" : "Off"}
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium">High Risk Alerts</div>
                                <p className="text-sm text-muted-foreground">Instant alerts for high-risk patient flags</p>
                            </div>
                            <Button
                                variant={highRiskAlerts ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHighRiskAlerts(!highRiskAlerts)}
                                disabled={isLoadingPreferences || isSavingPreferences}
                            >
                                {highRiskAlerts ? "On" : "Off"}
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-medium">Weekly Reports</div>
                                <p className="text-sm text-muted-foreground">Summary of patient activity and insights</p>
                            </div>
                            <Button
                                variant={weeklyReports ? "default" : "outline"}
                                size="sm"
                                onClick={() => setWeeklyReports(!weeklyReports)}
                                disabled={isLoadingPreferences || isSavingPreferences}
                            >
                                {weeklyReports ? "On" : "Off"}
                            </Button>
                        </div>

                        {lastWeeklyReportSentAt && (
                            <p className="text-xs text-muted-foreground">
                                Last weekly summary sent {new Date(lastWeeklyReportSentAt).toLocaleString()}.
                            </p>
                        )}
                    </div>

                    {preferencesError && (
                        <p className="mt-4 text-sm text-destructive">{preferencesError}</p>
                    )}

                    {preferencesSuccess && !preferencesError && (
                        <p className="mt-4 text-sm text-emerald-600">{preferencesSuccess}</p>
                    )}

                    <Button className="mt-6" onClick={handleSavePreferences} disabled={isLoadingPreferences || isSavingPreferences}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingPreferences ? "Saving..." : "Save Preferences"}
                    </Button>
                </Panel>

                {/* Security */}
                <Panel className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Password</Label>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Manage your password in the MindBridge authentication settings.
                            </p>
                            <Button variant="outline" onClick={() => window.location.href = "/auth/sign-in"}>
                                Update Password
                            </Button>
                        </div>

                        <Separator />

                        <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Add an extra layer of security to your account.
                            </p>
                            <Button variant="outline" onClick={() => window.location.href = "/auth/two-factor?setup=1"}>
                                Enable 2FA
                            </Button>
                        </div>

                        <Separator />

                        <div>
                            <Label>Passkeys</Label>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Use passkeys for fast, phishing-resistant sign-in.
                            </p>
                            <Button variant="outline" onClick={() => window.location.href = "/auth/passkeys"}>
                                Manage Passkeys
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
    );
}
