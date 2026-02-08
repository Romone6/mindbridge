"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useClinic } from "@/components/providers/clinic-provider";

type InviteRole = "CLINICIAN" | "STAFF" | "READ_ONLY";

type Invite = {
  id: string;
  email: string;
  role: InviteRole;
  expires_at: string;
  created_at: string;
};

type Member = {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  name: string | null;
  email: string | null;
};

const INVITE_ROLES: InviteRole[] = ["CLINICIAN", "STAFF", "READ_ONLY"];

export default function TeamPage() {
  const { currentClinic, isLoading: isClinicLoading } = useClinic();

  const canManageTeam = useMemo(() => {
    return currentClinic?.role === "OWNER" || currentClinic?.role === "STAFF";
  }, [currentClinic?.role]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("CLINICIAN");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [isRevokingInviteId, setIsRevokingInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clinicId = currentClinic?.id || null;

  const loadTeamData = useCallback(async () => {
    if (!clinicId) {
      setInvites([]);
      setMembers([]);
      setIsLoadingTeam(false);
      return;
    }

    setIsLoadingTeam(true);
    setError(null);

    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/clinics/${clinicId}/members`, { method: "GET" }),
        fetch(`/api/clinics/${clinicId}/invite`, { method: "GET" }),
      ]);

      const membersJson = (await membersRes.json()) as { error?: string; members?: Member[] };
      const invitesJson = (await invitesRes.json()) as { error?: string; invites?: Invite[] };

      if (!membersRes.ok) {
        throw new Error(membersJson.error || "Failed to load team members.");
      }

      if (!invitesRes.ok) {
        throw new Error(invitesJson.error || "Failed to load pending invites.");
      }

      setMembers(membersJson.members || []);
      setInvites(invitesJson.invites || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load team workspace data.";
      setError(message);
    } finally {
      setIsLoadingTeam(false);
    }
  }, [clinicId]);

  useEffect(() => {
    void loadTeamData();
  }, [loadTeamData]);

  const onInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clinicId || !canManageTeam) return;

    setError(null);
    setSuccess(null);
    setIsSubmittingInvite(true);

    try {
      const response = await fetch(`/api/clinics/${clinicId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = (await response.json()) as { error?: string; invite?: Invite };
      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite.");
      }

      setInviteEmail("");
      setSuccess(`Invite sent to ${data.invite?.email || "user"}.`);
      await loadTeamData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invite.";
      setError(message);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const onRevokeInvite = async (inviteId: string) => {
    if (!clinicId || !canManageTeam) return;

    setError(null);
    setSuccess(null);
    setIsRevokingInviteId(inviteId);

    try {
      const response = await fetch(`/api/clinics/${clinicId}/invite?inviteId=${inviteId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string; success?: boolean };
      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke invite.");
      }

      setSuccess("Invite revoked.");
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke invite.";
      setError(message);
    } finally {
      setIsRevokingInviteId(null);
    }
  };

  if (isClinicLoading) {
    return <p className="text-sm text-muted-foreground">Loading workspace...</p>;
  }

  if (!currentClinic) {
    return (
      <Panel className="p-6">
        <h2 className="text-lg font-semibold">Team workspace</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a clinic first to invite clinicians to a shared workspace.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team workspace</h2>
        <p className="text-sm text-muted-foreground">
          Invite clinicians to {currentClinic.name} and manage pending access requests.
        </p>
      </div>

      <Panel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Invite clinician</h3>

        {!canManageTeam && (
          <p className="text-sm text-muted-foreground">
            You need OWNER or STAFF permissions to send invites.
          </p>
        )}

        <form className="space-y-4" onSubmit={onInvite}>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Clinician email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="clinician@clinic.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              required
              disabled={!canManageTeam || isSubmittingInvite}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as InviteRole)}
              disabled={!canManageTeam || isSubmittingInvite}
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && !error && <p className="text-sm text-emerald-600">{success}</p>}

          <Button type="submit" disabled={!canManageTeam || isSubmittingInvite}>
            {isSubmittingInvite ? "Sending invite..." : "Send invite"}
          </Button>
        </form>
      </Panel>

      <Panel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Pending invites</h3>

        {isLoadingTeam ? (
          <p className="text-sm text-muted-foreground">Loading pending invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {invite.role} · Expires {new Date(invite.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevokeInvite(invite.id)}
                    disabled={!canManageTeam || isRevokingInviteId === invite.id}
                  >
                    {isRevokingInviteId === invite.id ? "Revoking..." : "Revoke"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Current members</h3>

        {isLoadingTeam ? (
          <p className="text-sm text-muted-foreground">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members found for this workspace.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member.id} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{member.name || member.email || member.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email || "No email available"} · {member.role} · Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
