"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useClinic } from "@/components/providers/clinic-provider";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface PatientLink {
    id: string;
    link_token: string;
    expires_at: string | null;
    created_at: string;
    last_used_at: string | null;
    status: 'active' | 'expired' | 'used';
}

export function PatientLinksList() {
    const { currentClinic } = useClinic();
    const { getToken } = useAuth();
    const [links, setLinks] = useState<PatientLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentClinic) return;
        const fetchLinks = async () => {
            setIsLoading(true);
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createClerkSupabaseClient(token!);
                if (!supabase) return;

                const { data, error } = await supabase
                    .from('patient_links')
                    .select('*')
                    .eq('clinic_id', currentClinic.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Determine status
                const now = new Date();
                const processedLinks = data.map(link => {
                    const expiresAt = link.expires_at ? new Date(link.expires_at) : null;
                    let status: 'active' | 'expired' | 'used' = 'active';
                    if (expiresAt && expiresAt < now) {
                        status = 'expired';
                    }
                    // Note: last_used_at not implemented yet, assume active if not expired
                    return { ...link, status };
                });

                setLinks(processedLinks as PatientLink[]);
            } catch (err) {
                console.error("Failed to load links:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLinks();
    }, [currentClinic, getToken]);

    const copyLink = async (token: string) => {
        const url = `${window.location.origin}/t/${token}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-500/20 text-green-400">Active</Badge>;
            case 'expired':
                return <Badge variant="secondary">Expired</Badge>;
            case 'used':
                return <Badge variant="outline">Used</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Panel className="h-[300px] flex items-center justify-center border-border bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Panel>
        );
    }

    return (
        <Panel className="overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Issued Patient Links</h3>
                    <Badge variant="outline" className="text-[10px] px-2">
                        {links.length}
                    </Badge>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map((link) => (
                        <TableRow key={link.id}>
                            <TableCell>
                                {getStatusBadge(link.status)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(link.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {link.last_used_at ? new Date(link.last_used_at).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyLink(link.link_token)}
                                        disabled={link.status !== 'active'}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => window.open(`${window.location.origin}/t/${link.link_token}`, '_blank')}
                                        disabled={link.status !== 'active'}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {links.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No patient links issued yet
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Panel>
    );
}