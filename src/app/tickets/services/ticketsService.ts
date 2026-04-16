// ─── Tickets Service ──────────────────────────────────────────────────────────
// Wraps all ticket endpoints:
//   READ:
//   - GET /tickets              → getAll()
//   - GET /tickets/available    → getAvailable()
//   - GET /tickets/status/{s}   → getByStatus()
//   - GET /tickets/type/{t}     → getByType()
//   - GET /tickets/{id}         → getById()
//   WRITE:
//   - POST /tickets             → create()          (multipart/form-data)
//   - POST /tickets/{id}        → update()          (multipart/form-data, uses POST not PUT)
//   - POST /tickets/{id}/claim  → claim()
//   - POST /tickets/{id}/assign/{userId} → assign()
//   - POST /tickets/{id}/unassign        → unassign()
//   - POST /tickets/{id}/status          → updateStatus() (JSON)
//   - POST /tickets/{id}/complete        → complete()
//   DELETE:
//   - DELETE /tickets/{id}      → delete()
//
// All methods use the shared apiClient from @/services/api which automatically
// attaches the Bearer token and triggers toasts on errors via interceptors.

import type { AxiosRequestConfig } from "axios"
import { apiClient } from "@/services/api"
import type {
  ApiTicket,
  ApiTicketListResponse,
  ApiTicketResponse,
  ApiTicketStatus,
  ApiTicketType,
  TicketFormValues,
  TicketListParams,
} from "@/app/tickets/types"

// Build a plain query-param object, omitting undefined/falsy keys
function buildParams(params: TicketListParams): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (params.page !== undefined)     p.page     = params.page
  if (params.per_page !== undefined) p.per_page = params.per_page
  return p
}

class TicketsService {
  /**
   * GET /tickets
   * Returns the full paginated list of all tickets.
   */
  async getAll(params: TicketListParams = {}): Promise<ApiTicketListResponse> {
    return (await apiClient.get<unknown>("/tickets", {
      params: buildParams(params),
    })) as unknown as ApiTicketListResponse
  }

  /**
   * GET /tickets/available
   * Returns only open, unassigned tickets (paginated).
   */
  async getAvailable(params: TicketListParams = {}): Promise<ApiTicketListResponse> {
    return (await apiClient.get<unknown>("/tickets/available", {
      params: buildParams(params),
    })) as unknown as ApiTicketListResponse
  }

  /**
   * GET /tickets/status/{status}
   * Returns tickets filtered by a single status value.
   * Backend validates the status and returns 400 on invalid value.
   */
  async getByStatus(
    status: ApiTicketStatus,
    params: TicketListParams = {},
  ): Promise<ApiTicketListResponse> {
    return (await apiClient.get<unknown>(`/tickets/status/${status}`, {
      params: buildParams(params),
    })) as unknown as ApiTicketListResponse
  }

  /**
   * GET /tickets/type/{type}
   * Returns tickets filtered by a single type value.
   * Backend validates the type and returns 400 on invalid value.
   */
  async getByType(
    type: ApiTicketType,
    params: TicketListParams = {},
  ): Promise<ApiTicketListResponse> {
    return (await apiClient.get<unknown>(`/tickets/type/${type}`, {
      params: buildParams(params),
    })) as unknown as ApiTicketListResponse
  }

  /**
   * GET /tickets/{id}
   * Returns a single ticket with requester, assignee, and attachments loaded.
   * Throws if the ticket does not exist (backend returns 404).
   */
  async getById(id: number): Promise<ApiTicket> {
    // apiClient.get wraps the outer { success, data, message } envelope,
    // so cast through unknown to reach the nested data object.
    const response = await apiClient.get<{ data: ApiTicket }>(`/tickets/${id}`)
    return (response as unknown as { data: ApiTicket }).data
  }

  // ── Write endpoints ─────────────────────────────────────────────────────────

  /**
   * POST /tickets  (multipart/form-data)
   * Creates a new ticket. Public endpoint — no auth required, but authenticated
   * users have their identity auto-assigned. Guests must include requester_name.
   * Returns the newly created ticket (HTTP 201).
   */
  async create(values: TicketFormValues): Promise<ApiTicket> {
    const fd = buildFormData(values, "create")
    const resp = (await apiClient.postMultipart<unknown>("/tickets", fd, {
      toast: { success: "Ticket created successfully" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}  (multipart/form-data)
   * Updates an existing ticket. Uses POST (not PUT) to support file uploads.
   * Returns the updated ticket (HTTP 200).
   */
  async update(id: number, values: TicketFormValues): Promise<ApiTicket> {
    const fd = buildFormData(values, "update")
    const resp = (await apiClient.postMultipart<unknown>(`/tickets/${id}`, fd, {
      toast: { success: "Ticket updated successfully" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}/claim
   * Assigns the currently authenticated user to the ticket (self-claim).
   * Returns the updated ticket (HTTP 200).
   */
  async claim(id: number): Promise<ApiTicket> {
    const resp = (await apiClient.post<unknown>(`/tickets/${id}/claim`, undefined, {
      toast: { success: "Ticket claimed successfully" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}/assign/{userId}
   * Assigns a specific user to the ticket.
   * Returns the updated ticket (HTTP 200).
   */
  async assign(id: number, userId: number): Promise<ApiTicket> {
    const resp = (await apiClient.post<unknown>(`/tickets/${id}/assign/${userId}`, undefined, {
      toast: { success: "Ticket assigned successfully" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}/unassign
   * Removes the assignee from the ticket.
   * Returns the updated ticket (HTTP 200).
   */
  async unassign(id: number): Promise<ApiTicket> {
    const resp = (await apiClient.post<unknown>(`/tickets/${id}/unassign`, undefined, {
      toast: { success: "Ticket unassigned successfully" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}/status  (application/json)
   * Updates the ticket's status field.
   * Returns the updated ticket (HTTP 200).
   */
  async updateStatus(id: number, status: ApiTicketStatus): Promise<ApiTicket> {
    const resp = (await apiClient.post<unknown>(
      `/tickets/${id}/status`,
      { status },
      { toast: { success: "Status updated successfully" } } as AxiosRequestConfig,
    )) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * POST /tickets/{id}/complete
   * Marks the ticket as completed.
   * Returns the updated ticket (HTTP 200).
   */
  async complete(id: number): Promise<ApiTicket> {
    const resp = (await apiClient.post<unknown>(`/tickets/${id}/complete`, undefined, {
      toast: { success: "Ticket marked as complete" },
    } as AxiosRequestConfig)) as unknown as ApiTicketResponse
    return resp.data
  }

  /**
   * DELETE /tickets/{id}
   * Permanently deletes a ticket.
   * Returns 200 on success with a confirmation message.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tickets/${id}`, {
      toast: { success: "Ticket deleted successfully" },
    } as AxiosRequestConfig)
  }
}

// ─── FormData builder ─────────────────────────────────────────────────────────
// Converts TicketFormValues into multipart/form-data accepted by the backend.
// Only appends fields that are defined so optional fields aren't sent as "null".
function buildFormData(values: TicketFormValues, mode: "create" | "update"): FormData {
  const fd = new FormData()

  fd.append("title", values.title)
  fd.append("description", values.description)
  fd.append("type", values.type)
  fd.append("priority", values.priority)

  // Status is only sent during updates (create always starts as "open")
  if (mode === "update" && values.status) {
    fd.append("status", values.status)
  }

  // Null means "clear the assignee" — send the string "null" for the backend
  if (values.assigned_to !== undefined) {
    fd.append("assigned_to", values.assigned_to === null ? "" : String(values.assigned_to))
  }

  // Guest name — only needed when not authenticated or for guest-submitted tickets
  if (values.requester_name) {
    fd.append("requester_name", values.requester_name)
  }

  // New file attachments — appended as an array
  if (values.newAttachments?.length) {
    values.newAttachments.forEach((file) => fd.append("attachments[]", file))
  }

  // IDs of existing attachments to keep (edit mode only)
  if (mode === "update" && values.keepAttachmentIds?.length) {
    values.keepAttachmentIds.forEach((id) => fd.append("keep_attachments[]", String(id)))
  }

  return fd
}

export const ticketsService = new TicketsService()
