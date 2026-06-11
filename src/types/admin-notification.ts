/**
 * Wire shape for `/api/v1/admin/notifications/*` (owner/admin/staff).
 *
 * Mirrors the backend Broadcast / SendToUser request DTOs. For broadcast the
 * `school_id` comes from the JWT; for send-to-user the target id is the path
 * param — neither is in the body. See
 * `backend-service/internal/modules/notification/handler_admin.go`.
 */
export interface AdminNotificationInput {
  title: string;
  message: string;
  type: string;
  action_url?: string;
}
