// ─── SUPABASE CONFIG ─────────────────────────────────────────
export const SUPABASE_URL = "https://bqspprdmvludxeokcyjp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxc3BwcmRtdmx1ZHhlb2tjeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTkzMzgsImV4cCI6MjA5NjQzNTMzOH0.AgaMkfIgX4yB5rQ7M-Em5DG3_ONZAQwtKRQd_rz3utY";

export const sb = {
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  },

  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: sb.headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(table, id, data, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "PATCH", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async upsert(table, data, onConflict = "") {
    const url = `${SUPABASE_URL}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...sb.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(table, id, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "DELETE", headers: sb.headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};
