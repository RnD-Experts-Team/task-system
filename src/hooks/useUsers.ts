import { useEffect } from "react"
import { useUsersStore } from "@/app/users/stores/usersStore"

/**
 * Hook that connects a component to the users store.
 *
 * On first render it triggers `fetchUsers(initialPage)` automatically,
 * then exposes the full store slice (list + CRUD + detail + projects + tasks) to the UI.
 *
 * @param initialPage - Which API page to load on mount (default: 1)
 */
export function useUsers(initialPage = 1) {
  const {
    users,
    pagination,
    loading,
    error,
    submitting,
    submitError,
    selectedUser,
    selectedLoading,
    // Roles & permissions state
    rolesAndPermissions,
    rolesPermissionsLoading,
    rolesPermissionsError,
    syncingRolesPermissions,
    // User projects state
    userProjects,
    userProjectsPagination,
    userProjectsLoading,
    userProjectsError,
    // User task assignments state
    userTaskAssignments,
    userTaskAssignmentsLoading,
    userTaskAssignmentsError,
    // Requested help-requests state
    userRequestedHelpRequests,
    userRequestedHelpRequestsPagination,
    userRequestedHelpRequestsLoading,
    userRequestedHelpRequestsError,
    // Helper help-requests state
    userHelperHelpRequests,
    userHelperHelpRequestsPagination,
    userHelperHelpRequestsLoading,
    userHelperHelpRequestsError,
    // Requested tickets state
    userRequestedTickets,
    userRequestedTicketsPagination,
    userRequestedTicketsLoading,
    userRequestedTicketsError,
    // Assigned tickets state
    userAssignedTickets,
    userAssignedTicketsPagination,
    userAssignedTicketsLoading,
    userAssignedTicketsError,
    // Actions
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    clearError,
    clearSubmitError,
    // Roles & permissions actions
    fetchRolesAndPermissions,
    syncRoles,
    syncPermissions,
    syncRolesAndPermissions,
    clearRolesPermissionsError,
    // User projects actions
    fetchUserProjects,
    clearUserProjects,
    // User task assignments actions
    fetchUserTaskAssignments,
    clearUserTaskAssignments,
    // Requested help-requests actions
    fetchUserRequestedHelpRequests,
    clearUserRequestedHelpRequests,
    // Helper help-requests actions
    fetchUserHelperHelpRequests,
    clearUserHelperHelpRequests,
    // Requested tickets actions
    fetchUserRequestedTickets,
    clearUserRequestedTickets,
    // Assigned tickets actions
    fetchUserAssignedTickets,
    clearUserAssignedTickets,
  } = useUsersStore()

  // Fetch on mount; re-runs only if initialPage changes
  useEffect(() => {
    fetchUsers(initialPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage])

  return {
    users,
    pagination,
    loading,
    error,
    /** True while a create / update / delete is in-flight */
    submitting,
    /** Error message from the last mutation */
    submitError,
    /** Single user loaded by getUser (for detail sheet) */
    selectedUser,
    /** True while getUser is loading */
    selectedLoading,
    /** Fetch a specific page of users */
    fetchUsers,
    /** Fetch a single user by id */
    getUser,
    /** Create a new user — returns the created user on success, null on failure */
    createUser,
    /** Update a user — returns true on success */
    updateUser,
    /** Delete a user — returns true on success */
    deleteUser,
    /** Dismiss the list error banner */
    clearError,
    /** Dismiss the mutation error */
    clearSubmitError,
    // ── Roles & permissions ──────────────────────────────────────────────────
    /** Roles & permissions data for a user */
    rolesAndPermissions,
    /** True while loading roles-and-permissions */
    rolesPermissionsLoading,
    /** Error from roles-and-permissions operations */
    rolesPermissionsError,
    /** True while syncing roles/permissions */
    syncingRolesPermissions,
    /** Fetch roles-and-permissions by user id */
    fetchRolesAndPermissions,
    /** Sync user roles */
    syncRoles,
    /** Sync user permissions */
    syncPermissions,
    /** Sync both roles and permissions */
    syncRolesAndPermissions,
    /** Dismiss roles-permissions error */
    clearRolesPermissionsError,
    // ── User Projects (stakeholder) ──────────────────────────────────────────
    /** Projects where the user is stakeholder */
    userProjects,
    /** Pagination metadata for userProjects */
    userProjectsPagination,
    /** True while loading user projects */
    userProjectsLoading,
    /** Error from user projects fetch */
    userProjectsError,
    /** Fetch a page of projects for a user */
    fetchUserProjects,
    /** Clear user projects from store */
    clearUserProjects,
    // ── User Task Assignments ────────────────────────────────────────────────
    /** Tasks assigned to a user */
    userTaskAssignments,
    /** True while loading task assignments */
    userTaskAssignmentsLoading,
    /** Error from task assignments fetch */
    userTaskAssignmentsError,
    /** Fetch all task assignments for a user */
    fetchUserTaskAssignments,
    /** Clear task assignments from store */
    clearUserTaskAssignments,
    // ── Requested Help Requests ──────────────────────────────────────────────
    /** Help requests submitted by a user (as requester) */
    userRequestedHelpRequests,
    /** Pagination metadata for requested help requests */
    userRequestedHelpRequestsPagination,
    /** True while loading requested help requests */
    userRequestedHelpRequestsLoading,
    /** Error from requested help-requests fetch */
    userRequestedHelpRequestsError,
    /** Fetch a page of help requests requested by a user */
    fetchUserRequestedHelpRequests,
    /** Clear requested help requests from store */
    clearUserRequestedHelpRequests,
    // ── Helper Help Requests ─────────────────────────────────────────────────
    /** Help requests where this user is the assigned helper */
    userHelperHelpRequests,
    /** Pagination metadata for helper help requests */
    userHelperHelpRequestsPagination,
    /** True while loading helper help requests */
    userHelperHelpRequestsLoading,
    /** Error from helper help-requests fetch */
    userHelperHelpRequestsError,
    /** Fetch a page of help requests where user is helper */
    fetchUserHelperHelpRequests,
    /** Clear helper help requests from store */
    clearUserHelperHelpRequests,
    // ── Requested Tickets ────────────────────────────────────────────────────
    /** Tickets submitted by this user (as requester) */
    userRequestedTickets,
    /** Pagination metadata for requested tickets */
    userRequestedTicketsPagination,
    /** True while loading requested tickets */
    userRequestedTicketsLoading,
    /** Error from requested-tickets fetch */
    userRequestedTicketsError,
    /** Fetch a page of tickets requested by this user */
    fetchUserRequestedTickets,
    /** Clear requested tickets from store */
    clearUserRequestedTickets,
    // ── Assigned Tickets ─────────────────────────────────────────────────────
    /** Tickets currently assigned to this user */
    userAssignedTickets,
    /** Pagination metadata for assigned tickets */
    userAssignedTicketsPagination,
    /** True while loading assigned tickets */
    userAssignedTicketsLoading,
    /** Error from assigned-tickets fetch */
    userAssignedTicketsError,
    /** Fetch a page of tickets assigned to this user */
    fetchUserAssignedTickets,
    /** Clear assigned tickets from store */
    clearUserAssignedTickets,
  } as const
}
