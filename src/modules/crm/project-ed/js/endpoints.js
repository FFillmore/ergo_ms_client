export const projectEdEndpoints = {
    project_ed: {
        projects: {
            list: 'project_ed/projects/',
            create: 'project_ed/projects/',
            detail: (id) => `project_ed/projects/${id}/`,
            publicView: (id) => `project_ed/projects/${id}/public_view/`,
            update: (id) => `project_ed/projects/${id}/`,
            delete: (id) => `project_ed/projects/${id}/`,
            auditLogs: (id) => `project_ed/projects/${id}/audit_logs/`,
        },
        categories: {
            list: 'project_ed/categories/',
            create: 'project_ed/categories/',
            detail: (id) => `project_ed/categories/${id}/`,
            update: (id) => `project_ed/categories/${id}/`,
            patch: (id) => `project_ed/categories/${id}/`,
            updateOrder: (id) => `project_ed/categories/${id}/update_order/`,
            delete: (id) => `project_ed/categories/${id}/safe_delete/`,
        },
        subcategories: {
            list: 'project_ed/subcategories/',
            create: 'project_ed/subcategories/',
            detail: (id) => `project_ed/subcategories/${id}/`,
            update: (id) => `project_ed/subcategories/${id}/`,
            delete: (id) => `project_ed/subcategories/${id}/safe_delete/`,
        },
        target_indicators: {
            list: 'project_ed/target-indicators/',
            create: 'project_ed/target-indicators/',
            detail: (id) => `project_ed/target-indicators/${id}/`,
            update: (id) => `project_ed/target-indicators/${id}/`,
            delete: (id) => `project_ed/target-indicators/${id}/`,
        },
        event_blocks: {
            list: 'project_ed/event-blocks/',
            create: 'project_ed/event-blocks/',
            detail: (id) => `project_ed/event-blocks/${id}/`,
            update: (id) => `project_ed/event-blocks/${id}/`,
            patch: (id) => `project_ed/event-blocks/${id}/`,
            delete: (id) => `project_ed/event-blocks/${id}/safe_delete/`,
            updateOrder: (id) => `project_ed/event-blocks/${id}/update_order/`,
            events: (id) => `project_ed/event-blocks/${id}/events/`,
            indicators: (id) => `project_ed/event-blocks/${id}/indicators/`,
        },
        events: {
            list: 'project_ed/events/',
            create: 'project_ed/events/',
            detail: (id) => `project_ed/events/${id}/`,
            update: (id) => `project_ed/events/${id}/`,
            patch: (id) => `project_ed/events/${id}/`,
            delete: (id) => `project_ed/events/${id}/safe_delete/`,
            updateOrder: (id) => `project_ed/events/${id}/update_order/`,
        },
        import: {
            excel: 'project_ed/import/excel/',
        },
        profiles: {
            list: 'project_ed/profiles/profiles/',
            detail: (id) => `project_ed/profiles/profiles/${id}/`,
            leadership: 'project_ed/profiles/profiles/leadership/',
            userProjects: (id) => `project_ed/profiles/profiles/${id}/projects/`,
        },
        notifications: {
            list: 'project_ed/notifications/',
            detail: (id) => `project_ed/notifications/${id}/`,
            unreadCount: 'project_ed/notifications/unread_count/',
            markRead: (id) => `project_ed/notifications/${id}/mark_read/`,
            markAllRead: 'project_ed/notifications/mark_all_read/',
        }
    }
};

