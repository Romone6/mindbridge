"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PatientQueue } from "@/components/dashboard/patient-queue";
import { PatientLinkGenerator } from "@/components/dashboard/patient-link-generator";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { UserPlus, Building2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useClinic } from "@/components/providers/clinic-provider";

export default function DashboardPage() {
  const { user } = useUser();
  const { currentClinic } = useClinic();

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1>Clinical dashboard</h1>
          <p className="text-muted-foreground">
            {user?.firstName ? `Welcome, Dr. ${user.firstName}. ` : ""}
            Use this workspace to manage intake and triage workflows.
          </p>
        </div>

        <Panel className="p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Getting started</h2>
            <p className="text-sm text-muted-foreground">
              Set up your clinic, invite teammates, and share your intake link.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Panel className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Clinic setup
              </div>
              <p className="text-xs text-muted-foreground">
                {currentClinic ? "Clinic configured." : "No clinic configured yet."}
              </p>
              <Link href="/onboarding">
                <Button size="sm" variant="outline" className="w-full">
                  {currentClinic ? "Update clinic details" : "Create clinic"}
                </Button>
              </Link>
            </Panel>

            <Panel className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Team access
              </div>
              <p className="text-xs text-muted-foreground">Invite clinicians to this workspace.</p>
              <Link href="/dashboard/team">
                <Button size="sm" variant="outline" className="w-full">
                  Invite user
                </Button>
              </Link>
            </Panel>

            <PatientLinkGenerator />
          </div>
        </Panel>

        <PatientQueue />
      </div>
    </DashboardShell>
  );
}
