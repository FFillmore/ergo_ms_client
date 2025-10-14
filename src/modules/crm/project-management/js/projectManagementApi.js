/**
 * Сервис для работы с Project Management API
 */

import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

class ProjectManagementApi {
    constructor() {
        this.endpoints = endpoints.project_management
    }

    /**
     * Преобразует ответ apiClient в формат axios для совместимости
     */
    _adaptResponse(response) {
        // apiClient возвращает { success, data, message }
        // Старый код ожидает { data: ... } как axios
        if (response && response.data !== undefined) {
            return { data: response.data }
        }
        return { data: response }
    }

    /**
     * Обработка вызовов API с адаптацией ответа
     */
    async _safeCall(fn) {
        try {
            const result = await fn()
            return this._adaptResponse(result)
        } catch (error) {
            throw error
        }
    }

    // ===== ПРОЕКТЫ =====
    
    async getProjects(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.projects, params))
    }

    async getProject(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectDetail(id)))
    }

    async createProject(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.projects, data))
    }

    async updateProject(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.projectDetail(id), data))
    }

    async deleteProject(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.projectDetail(id)))
    }

    async getProjectTasks(projectId) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectTasks(projectId)))
    }

    async getProjectStatistics(projectId) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectStatistics(projectId)))
    }

    async addProjectMember(projectId, userData) {
        return this._safeCall(() => apiClient.post(this.endpoints.addProjectMember(projectId), userData))
    }

    async removeProjectMember(projectId, userId) {
        return this._safeCall(() => apiClient.delete(this.endpoints.removeProjectMember(projectId), {
            user_id: userId
        }))
    }

    async exportProjects(format = 'csv') {
        return this._safeCall(() => apiClient.downloadFile(this.endpoints.exportProjects, { format }))
    }

    // ===== ЗАДАЧИ =====
    
    async getTasks(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.tasks, params))
    }

    async getTask(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskDetail(id)))
    }

    async createTask(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.tasks, data))
    }

    async updateTask(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.taskDetail(id), data))
    }

    async deleteTask(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.taskDetail(id)))
    }

    async changeTaskStatus(taskId, status) {
        return this._safeCall(() => apiClient.post(this.endpoints.changeTaskStatus(taskId), { status }))
    }

    async exportTasks(format = 'csv', projectId = null) {
        const params = { format }
        if (projectId) {
            params.project_id = projectId
        }
        return this._safeCall(() => apiClient.downloadFile(this.endpoints.exportTasks, params))
    }

    // ===== КАЛЕНДАРЬ =====
    
    async getTasksForCalendar(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.tasksCalendar, params))
    }

    async createTaskFromCalendar(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.createTaskFromCalendar, data))
    }

    // ===== КАНБАН =====
    
    async getKanbanTasks(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.tasksKanban, params))
    }

    async updateTaskKanbanOrder(taskId, data) {
        return this._safeCall(() => apiClient.post(this.endpoints.updateTaskKanbanOrder(taskId), data))
    }

    // ===== КОММЕНТАРИИ =====
    
    async getTaskComments(taskId) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskComments, {
            task_id: taskId
        }))
    }

    async addTaskComment(taskId, content) {
        return this._safeCall(() => apiClient.post(this.endpoints.addTaskComment(taskId), { content }))
    }

    async updateTaskComment(commentId, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.taskCommentDetail(commentId), data))
    }

    async deleteTaskComment(commentId) {
        return this._safeCall(() => apiClient.delete(this.endpoints.taskCommentDetail(commentId)))
    }

    // ===== УЧЕТ ВРЕМЕНИ =====
    
    async getTimeLogs(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.timeLogs, params))
    }

    async getMyTimeLogs() {
        return this._safeCall(() => apiClient.get(this.endpoints.myTimeLogs))
    }

    async addTimeLog(taskId, data) {
        return this._safeCall(() => apiClient.post(this.endpoints.addTimeLog(taskId), data))
    }

    async updateTimeLog(logId, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.timeLogDetail(logId), data))
    }

    async deleteTimeLog(logId) {
        return this._safeCall(() => apiClient.delete(this.endpoints.timeLogDetail(logId)))
    }

    // ===== ПОЛЬЗОВАТЕЛИ =====
    
    async getUsers(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.users, params))
    }

    // ===== ФАЙЛЫ =====
    
    async uploadFile(file, taskId = null) {
        const formData = new FormData()
        formData.append('file', file)
        if (taskId) {
            formData.append('task_id', taskId)
        }
        return this._safeCall(() => apiClient.upload(this.endpoints.uploadFile, formData))
    }

    // ===== СТАТИСТИКА =====
    
    async getDashboardStatistics() {
        try {
            const [projectsResponse, tasksResponse] = await Promise.all([
                this.getProjects({ my_projects: true }),
                this.getTasks({ my_tasks: true })
            ])

            const projects = projectsResponse.data?.results || projectsResponse.data || []
            const tasks = tasksResponse.data?.results || tasksResponse.data || []

            const now = new Date()
            const overdueTasks = tasks.filter(task => 
                task.due_date && 
                new Date(task.due_date) < now && 
                task.status !== 'done'
            )

            return {
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'active').length,
                myTasks: tasks.length,
                overdueTasks: overdueTasks.length,
                completedTasks: tasks.filter(t => t.status === 'done').length
            }
        } catch (error) {
            console.error('Ошибка получения статистики:', error)
            return {
                totalProjects: 0,
                activeProjects: 0,
                myTasks: 0,
                overdueTasks: 0,
                completedTasks: 0
            }
        }
    }

    // ===== ПОИСК =====
    
    async search(query, type = 'all') {
        const params = { search: query }
        
        if (type === 'projects') {
            return await this.getProjects(params)
        } else if (type === 'tasks') {
            return await this.getTasks(params)
        } else {
            const [projects, tasks] = await Promise.all([
                this.getProjects(params),
                this.getTasks(params)
            ])
            
            return {
                projects: projects.data?.results || projects.data || [],
                tasks: tasks.data?.results || tasks.data || []
            }
        }
    }

    // ===== СТАТУСЫ ПРОЕКТОВ =====
    
    async getProjectStatuses(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectStatuses, params))
    }

    async getProjectStatus(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectStatusDetail(id)))
    }

    async createProjectStatus(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.projectStatuses, data))
    }

    async updateProjectStatus(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.projectStatusDetail(id), data))
    }

    async deleteProjectStatus(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.projectStatusDetail(id)))
    }

    async getActiveProjectStatuses() {
        return this._safeCall(() => apiClient.get(this.endpoints.activeProjectStatuses))
    }

    async getDefaultProjectStatus() {
        return this._safeCall(() => apiClient.get(this.endpoints.defaultProjectStatus))
    }

    // ===== ПРИОРИТЕТЫ ПРОЕКТОВ =====
    
    async getProjectPriorities(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectPriorities, params))
    }

    async getProjectPriority(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.projectPriorityDetail(id)))
    }

    async createProjectPriority(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.projectPriorities, data))
    }

    async updateProjectPriority(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.projectPriorityDetail(id), data))
    }

    async deleteProjectPriority(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.projectPriorityDetail(id)))
    }

    async getActiveProjectPriorities() {
        return this._safeCall(() => apiClient.get(this.endpoints.activeProjectPriorities))
    }

    async getDefaultProjectPriority() {
        return this._safeCall(() => apiClient.get(this.endpoints.defaultProjectPriority))
    }

    // ===== СТАТУСЫ ЗАДАЧ =====
    
    async getTaskStatuses(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskStatuses, params))
    }

    async getTaskStatus(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskStatusDetail(id)))
    }

    async createTaskStatus(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.taskStatuses, data))
    }

    async updateTaskStatus(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.taskStatusDetail(id), data))
    }

    async deleteTaskStatus(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.taskStatusDetail(id)))
    }

    async getActiveTaskStatuses() {
        return this._safeCall(() => apiClient.get(this.endpoints.activeTaskStatuses))
    }

    async getKanbanTaskStatuses() {
        return this._safeCall(() => apiClient.get(this.endpoints.kanbanTaskStatuses))
    }

    async getDefaultTaskStatus() {
        return this._safeCall(() => apiClient.get(this.endpoints.defaultTaskStatus))
    }

    // ===== ПРИОРИТЕТЫ ЗАДАЧ =====
    
    async getTaskPriorities(params = {}) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskPriorities, params))
    }

    async getTaskPriority(id) {
        return this._safeCall(() => apiClient.get(this.endpoints.taskPriorityDetail(id)))
    }

    async createTaskPriority(data) {
        return this._safeCall(() => apiClient.post(this.endpoints.taskPriorities, data))
    }

    async updateTaskPriority(id, data) {
        return this._safeCall(() => apiClient.patch(this.endpoints.taskPriorityDetail(id), data))
    }

    async deleteTaskPriority(id) {
        return this._safeCall(() => apiClient.delete(this.endpoints.taskPriorityDetail(id)))
    }

    async getActiveTaskPriorities() {
        return this._safeCall(() => apiClient.get(this.endpoints.activeTaskPriorities))
    }

    async getDefaultTaskPriority() {
        return this._safeCall(() => apiClient.get(this.endpoints.defaultTaskPriority))
    }
}

const projectManagementApi = new ProjectManagementApi()
export default projectManagementApi
