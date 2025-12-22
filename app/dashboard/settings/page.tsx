"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Save, User, Bell, Shield, Mail } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
    const { user } = useUser();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [highRiskAlerts, setHighRiskAlerts] = useState(true);
    const [weeklyReports, setWeeklyReports] = useState(false);

    return (
        <DashboardShell>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account preferences and notification settings.
                    </p>
                </div>

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
                                    defaultValue={user?.firstName || ""}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    defaultValue={user?.lastName || ""}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
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
                            >
                                {weeklyReports ? "On" : "Off"}
                            </Button>
                        </div>
                    </div>

                    <Button className="mt-6">
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
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
                                Password management is handled by your authentication provider (Clerk).
                            </p>
                            <Button variant="outline">
                                Manage Password
                            </Button>
                        </div>

                        <Separator />

                        <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Add an extra layer of security to your account.
                            </p>
                            <Button variant="outline">
                                Enable 2FA
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </DashboardShell>
    );
}
