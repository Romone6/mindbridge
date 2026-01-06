"use client";

import { useCallback, useState, useEffect } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
            setInvites((invitesData ?? []) as Invite[]);

        } catch (error) {
            console.error("Failed to load team:", error);
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
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Failed to send invite";
            toast.error(message);
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
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold">Active members</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                                {member.user_id.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{member.user_id}</div>
                                                {member.user_id === userId && <span className="text-xs text-primary">(You)</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{member.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {member.user_id !== userId && (
                                            <Button variant="ghost" size="sm" onClick={() => handleRemove(member.id)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {members.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Panel>

                {/* Pending Invites */}
                {invites.length > 0 && (
                    <Panel className="overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold">Pending invites</h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invites.map((invite) => (
                                    <TableRow key={invite.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{invite.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{invite.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(invite.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(invite.id)} className="text-destructive hover:bg-destructive/10">
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Panel>
                )}
            </div>
        </div>
    );
}
