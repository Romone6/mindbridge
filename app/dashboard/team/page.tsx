"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Plus, Mail, Shield } from "lucide-react";
import { useClinic } from "@/components/providers/clinic-provider";

export default function TeamPage() {
    const { currentClinic } = useClinic();
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    // Mock data for now until we implement the Server Action
    const members = [
        { id: "1", name: "Dr. Sarah Chen", email: "sarah@example.com", role: "OWNER" },
        { id: "2", name: "Dr. James Wilson", email: "james@example.com", role: "CLINICIAN" },
    ];

    const handleInvite = () => {
        setIsInviting(true);
        // TODO: Call API to send invite
        setTimeout(() => {
            setIsInviting(false);
            setInviteEmail("");
            alert("Invite sent (mock)");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">
                        Manage access to {currentClinic?.name} workspace.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input 
                        placeholder="colleague@clinic.com" 
                        className="w-64" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </div>

            <Panel className="overflow-hidden">
                <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/5">
                        <tr className="text-left text-sm font-medium text-muted-foreground">
                            <th className="px-6 py-3">Member</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium">{member.name}</div>
                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm">{member.role}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}
