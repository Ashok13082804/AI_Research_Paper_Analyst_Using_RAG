const getApiUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

// Auth API Calls
export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${getApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid email or password");
    }
    return res.json();
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Load failed")) {
      throw new Error("Cannot connect to backend server. Please ensure the backend API is running on port 8000.");
    }
    throw err;
  }
}

export async function registerUser(userData: any) {
  try {
    const res = await fetch(`${getApiUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed. Email may already be registered.");
    }
    return res.json();
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Load failed")) {
      throw new Error("Cannot connect to backend server. Please ensure the backend API is running on port 8000.");
    }
    throw err;
  }
}

export async function fetchDashboardStats() {
  const res = await fetch(`${getApiUrl()}/admin/dashboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${getApiUrl()}/documents`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${getApiUrl()}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }
  return res.json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${getApiUrl()}/documents/${docId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
  return true;
}

export async function sendChatQuery(query: string, options: any = {}) {
  const res = await fetch(`${getApiUrl()}/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      ...options,
    }),
  });
  if (!res.ok) throw new Error("RAG Query failed");
  return res.json();
}

export async function executeAgentTool(agentType: string, documentIds: string[], extraParams: any = {}) {
  const res = await fetch(`${getApiUrl()}/agents/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_type: agentType,
      document_ids: documentIds,
      extra_params: extraParams,
    }),
  });
  if (!res.ok) throw new Error("Agent execution failed");
  return res.json();
}

export async function updateSettings(config: any) {
  const res = await fetch(`${getApiUrl()}/admin/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}
