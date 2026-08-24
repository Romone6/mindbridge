import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuditExportRouteHandlers } from "@/lib/intakes/audit-export-route";
import { createAuditLogsRouteHandlers } from "@/lib/intakes/audit-logs-route";

type FakeStore = {
  memberships: Array<{ clinic_id: string; user_id: string; role: string }>;
  intakes: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
};

function createSharedFakeSupabase(store: FakeStore) {
  class Query {
    private eqFilters: Array<{ field: string; value: unknown }> = [];
    private gteFilters: Array<{ field: string; value: string }> = [];
    private lteFilters: Array<{ field: string; value: string }> = [];
    private ilikeFilters: Array<{ field: string; value: string }> = [];
    private rangeWindow: { start: number; end: number } | null = null;
    private orderBy: { field: string; asc: boolean } | null = null;

    constructor(
      private table: "clinic_memberships" | "intakes" | "audit_export_logs",
    ) {}

    select(): this {
      return this;
    }

    eq(field: string, value: unknown): this {
      this.eqFilters.push({ field, value });
      return this;
    }

    gte(field: string, value: string): this {
      this.gteFilters.push({ field, value });
      return this;
    }

    lte(field: string, value: string): this {
      this.lteFilters.push({ field, value });
      return this;
    }

    ilike(field: string, value: string): this {
      this.ilikeFilters.push({ field, value });
      return this;
    }

    order(field: string, opts: { ascending: boolean }): this {
      this.orderBy = { field, asc: opts.ascending };
      return this;
    }

    range(start: number, end: number): this {
      this.rangeWindow = { start, end };
      return this;
    }

    insert(payload: Record<string, unknown>) {
      if (this.table !== "audit_export_logs") {
        return Promise.resolve({ error: { message: "invalid table" } });
      }

      const now =
        typeof payload.exported_at === "string"
          ? payload.exported_at
          : new Date().toISOString();

      store.auditLogs.push({
        id: `log-${store.auditLogs.length + 1}`,
        created_at: now,
        ...payload,
      });

      return Promise.resolve({ error: null });
    }

    single<T>() {
      const rows = this.executeRows();
      const row = rows[0] as T | undefined;
      if (!row) {
        return Promise.resolve({ data: null, error: { message: "not found" } });
      }

      return Promise.resolve({ data: row, error: null });
    }

    then<TResult1 = { data: unknown[]; error: null }>(
      onfulfilled?:
        | ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    ): Promise<TResult1> {
      const payload = { data: this.executeRows(), error: null as null };
      return Promise.resolve(payload).then(onfulfilled, onrejected);
    }

    private executeRows(): unknown[] {
      let rows: Array<Record<string, unknown>> =
        this.table === "clinic_memberships"
          ? [...store.memberships]
          : this.table === "intakes"
            ? [...store.intakes]
            : [...store.auditLogs];

      for (const filter of this.eqFilters) {
        rows = rows.filter((row) => row[filter.field] === filter.value);
      }

      for (const filter of this.gteFilters) {
        rows = rows.filter((row) => String(row[filter.field] ?? "") >= filter.value);
      }

      for (const filter of this.lteFilters) {
        rows = rows.filter((row) => String(row[filter.field] ?? "") <= filter.value);
      }

      for (const filter of this.ilikeFilters) {
        const needle = filter.value.replace(/%/g, "").toLowerCase();
        rows = rows.filter((row) =>
          String(row[filter.field] ?? "").toLowerCase().includes(needle),
        );
      }

      if (this.orderBy) {
        const { field, asc } = this.orderBy;
        rows.sort((a, b) => {
          const left = String(a[field] ?? "");
          const right = String(b[field] ?? "");
          return asc ? left.localeCompare(right) : right.localeCompare(left);
        });
      }

      if (this.rangeWindow) {
        rows = rows.slice(this.rangeWindow.start, this.rangeWindow.end + 1);
      }

      return rows;
    }
  }

  return {
    from(table: "clinic_memberships" | "intakes" | "audit_export_logs") {
      return new Query(table);
    },
  };
}

function makeIntakeRow(): Record<string, unknown> {
  return {
    id: "intake-1",
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    status: "reviewed",
    answers_json: {
      clinician_takeover: {
        claimed_at: "2026-02-10T00:00:00.000Z",
        claimed_by: "Dr Test",
      },
      clinician_workflow: {
        status: "Actioned",
        notes: [
          {
            content: "Reviewed",
            author: "Dr Test",
            timestamp: "2026-02-10T01:00:00.000Z",
          },
        ],
        auditTrail: [
          {
            timestamp: "2026-02-10T00:30:00.000Z",
            oldStatus: "In Review",
            newStatus: "Actioned",
            changedBy: "Dr Test",
          },
        ],
      },
    },
  };
}

test("audit export writes log consumable by audit logs endpoint", async () => {
  const store: FakeStore = {
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  };
  const supabase = createSharedFakeSupabase(store);

  const exportHandlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { name: "Dr Integration" } }),
  });

  const logsHandlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const exportResponse = await exportHandlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=json"),
  );

  assert.equal(exportResponse.status, 200);
  const exportPayload = (await exportResponse.json()) as { count: number };
  assert.equal(exportPayload.count, 3);

  const logsResponse = await logsHandlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1&format=json"),
  );

  assert.equal(logsResponse.status, 200);
  const logsPayload = (await logsResponse.json()) as {
    count: number;
    total: number;
    logs: Array<{
      export_format: string;
      event_count: number;
      exported_by_label: string;
    }>;
  };

  assert.equal(logsPayload.count, 1);
  assert.equal(logsPayload.total, 1);
  assert.equal(logsPayload.logs[0].export_format, "json");
  assert.equal(logsPayload.logs[0].event_count, 3);
  assert.equal(logsPayload.logs[0].exported_by_label, "Dr Integration");
});

test("audit logs filters can isolate csv export records", async () => {
  const store: FakeStore = {
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  };
  const supabase = createSharedFakeSupabase(store);

  const exportJsonHandlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { name: "Dr Json" } }),
  });

  const exportCsvHandlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { email: "csv@example.com" } }),
  });

  const logsHandlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const jsonResponse = await exportJsonHandlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=json"),
  );
  assert.equal(jsonResponse.status, 200);

  const csvResponse = await exportCsvHandlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=csv"),
  );
  assert.equal(csvResponse.status, 200);

  const logsResponse = await logsHandlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1&format=csv"),
  );

  assert.equal(logsResponse.status, 200);
  const logsPayload = (await logsResponse.json()) as {
    count: number;
    total: number;
    hasMore: boolean;
    logs: Array<{ export_format: string; exported_by_label: string }>;
  };

  assert.equal(logsPayload.count, 1);
  assert.equal(logsPayload.total, 1);
  assert.equal(logsPayload.hasMore, false);
  assert.equal(logsPayload.logs[0].export_format, "csv");
  assert.equal(logsPayload.logs[0].exported_by_label, "csv@example.com");
});
