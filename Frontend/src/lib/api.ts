import { getAuthToken } from "./auth"

const API_BASE = "/api"

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export interface Stats {
  organizations: number
  beneficiaries: number
  fundingRp: number
}

export interface NewsItem {
  id: number
  title: string
  summary: string
  tag: string
  tagColor: string
  imageUrl: string
  publishedAt: string
}

export interface Member {
  id: number
  name: string
  category: string
  contribution: string
}

export interface Campaign {
  id: number
  title: string
  description: string
  target: number
  collected: number
  percentage: number
}

export interface Donation {
  id: number
  amount: number
  program: string
  donorName: string
  email: string
  type: "once" | "monthly"
  createdAt: string
}

export interface ContactSubmission {
  id: number
  name: string
  category: string
  contact: string
  interest: string
  message: string
  submittedAt: string
}

export const api = {
  health: () => fetchJSON<{ status: string; message: string }>("/health"),

  stats: () => fetchJSON<Stats>("/stats"),

  news: {
    list: () => fetchJSON<NewsItem[]>("/news"),
    get: (id: number) => fetchJSON<NewsItem>(`/news/${id}`),
    create: (data: { title: string; summary: string; tag: string; tagColor: string; imageUrl?: string }) =>
      fetchJSON<NewsItem>("/news", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ title: string; summary: string; tag: string; tagColor: string; imageUrl: string }>) =>
      fetchJSON<NewsItem>(`/news/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => fetchJSON<{ message: string }>(`/news/${id}`, { method: "DELETE" }),
    uploadImage: (id: number, file: File) => {
      const token = getAuthToken()
      const formData = new FormData()
      formData.append("image", file)
      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
      return fetch(`${API_BASE}/news/${id}/image`, {
        method: "POST",
        headers,
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        return res.json() as Promise<{ imageUrl: string; message: string }>
      })
    },
  },

  members: {
    list: () => fetchJSON<Member[]>("/members"),
    get: (id: number) => fetchJSON<Member>(`/members/${id}`),
    create: (data: { name: string; category: string; contribution: string }) =>
      fetchJSON<Member>("/members", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ name: string; category: string; contribution: string }>) =>
      fetchJSON<Member>(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => fetchJSON<{ message: string }>(`/members/${id}`, { method: "DELETE" }),
  },

  campaign: () => fetchJSON<Campaign>("/campaign"),

  donations: {
    list: () => fetchJSON<Donation[]>("/donations"),
    create: (data: { amount: number; program: string; donorName?: string; email?: string; type?: string }) =>
      fetchJSON<Donation>("/donations", { method: "POST", body: JSON.stringify(data) }),
  },

  admin: {
    stats: () => fetchJSON<{
      totalNews: number
      totalMembers: number
      totalDonations: number
      totalDonationRp: number
      totalContacts: number
      campaignProgress: { collected: number; target: number; percentage: number }
    }>("/admin/stats"),
  },

  contact: {
    submit: (data: { name: string; category: string; contact: string; interest?: string; message?: string }) =>
      fetchJSON<ContactSubmission>("/contact", { method: "POST", body: JSON.stringify(data) }),
    list: () => fetchJSON<ContactSubmission[]>("/contact"),
  },
}
