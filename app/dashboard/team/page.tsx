"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Plus, Mail, Loader2, Trash2 } from "lucide-react";
import { useClinic } from "@/components/providers/clinic-provider";
import { inviteMember, revokeInvite, removeMember } from "@/app/actions/team";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Member = {
    id: string;
    user_id: string;
    role: string;
    // We don't have name/email in DB for now, so we'll show ID or fetch if possible
    // For MVP, we'll just show User ID
};

type Invite = {
    id: string;
    email: string;
    role: string;
    status: 'pending' | 'expired';
    created_at: string;
};

export default function TeamPage() {
    const { currentClinic } = useClinic();
    const { getToken, userId } = useAuth();
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentClinic) return;
        setIsLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            const supabase = createClerkSupabaseClient(token!);
            if (!supabase) return;

            // Fetch Members
            const { data: membersData, error: membersError } = await supabase
                .from('clinic_memberships')
                .select('*')
                .eq('clinic_id', currentClinic.id);
            
            if (membersError) throw membersError;
            setMembers(membersData as Member[]);

            // Fetch Invites
            const { data: invitesData, error: invitesError } = await supabase
                .from('clinic_invites')
                .select('*')
                .eq('clinic_id', currentClinic.id);

            if (invitesError) throw invitesError;
            setInvites(invitesData as Invite[]);

        } catch (err) {
            console.error("Failed to load team:", err);
            toast.error("Failed to load team data");
        } finally {
            setIsLoading(false);
        }
    }, [currentClinic, getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInvite = async () => {
        if (!currentClinic || !inviteEmail) return;
        setIsInviting(true);
        try {
            await inviteMember(currentClinic.id, inviteEmail);
            toast.success("Invite sent successfully");
            setInviteEmail("");
            fetchData(); // Refresh list
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                toast.error(err.message || "Failed to send invite");
            } else {
                toast.error("Failed to send invite");
            }
        } finally {
            setIsInviting(false);
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            await revokeInvite(id);
            toast.success("Invite revoked");
            fetchData();
        } catch {
            toast.error("Failed to revoke invite");
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await removeMember(id);
            toast.success("Member removed");
            fetchData();
        } catch {
            toast.error("Failed to remove member");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">
                        Manage access to {currentClinic?.name || "Clinic"} workspace.
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
                        {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Invite Member
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Active Members */}
                <Panel className="overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-semibold">Active Members</h3>
                    </div>
                    <table className="w-full">
                        <thead className="border-b border-white/10">
                            <tr className="text-left text-sm font-medium text-muted-foreground">
                                <th className="px-6 py-3">User ID</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                {member.user_id.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-mono text-sm">{member.user_id}</div>
                                                {member.user_id === userId && <span className="text-xs text-primary">(You)</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline">{member.role}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.user_id !== userId && (
                                            <Button variant="ghost" size="sm" onClick={() => handleRemove(member.id)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && !isLoading && (
                                <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No members found</td></tr>
                            )}
                        </tbody>
                    </table>
                </Panel>

                {/* Pending Invites */}
                {invites.length > 0 && (
                    <Panel className="overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="font-semibold">Pending Invites</h3>
                        </div>
                        <table className="w-full">
                            <thead className="border-b border-white/10">
                                <tr className="text-left text-sm font-medium text-muted-foreground">
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Sent</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite) => (
                                    <tr key={invite.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{invite.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary">{invite.role}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(invite.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(invite.id)} className="text-destructive hover:bg-destructive/10">
                                                Revoke
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                )}
            </div>
        </div>
    );
}
