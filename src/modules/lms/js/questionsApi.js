import { apiClient } from '../../../js/api/manager'
import { endpoints } from '../../../js/api/endpoints'

/**
 * API для работы с вопросами
 */
export const questionsApi = {
  /**
   * Получить вопросы по тесту
   */
  async getQuestionsByTest(testId) {
    try {
      const response = await apiClient.get(`${endpoints.lms.questions}?test=${testId}`)
      return response.data.results || response.data
    } catch (error) {
      console.error('Ошибка получения вопросов:', error)
      throw error
    }
  },

  /**
   * Создать вопрос
   */
  async createQuestion(questionData) {
    try {
      const response = await apiClient.post(endpoints.lms.questions, questionData)
      return response.data
    } catch (error) {
      console.error('Ошибка создания вопроса:', error)
      throw error
    }
  },

  /**
   * Обновить вопрос
   */
  async updateQuestion(questionId, questionData) {
    try {
      const response = await apiClient.put(endpoints.lms.questionDetail(questionId), questionData)
      return response.data
    } catch (error) {
      console.error('Ошибка обновления вопроса:', error)
      throw error
    }
  },

  /**
   * Удалить вопрос
   */
  async deleteQuestion(questionId) {
    try {
      await apiClient.delete(endpoints.lms.questionDetail(questionId))
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error)
      throw error
    }
  },

  /**
   * Получить вопрос по ID
   */
  async getQuestion(questionId) {
    try {
      const response = await apiClient.get(endpoints.lms.questionDetail(questionId))
      return response.data
    } catch (error) {
      console.error('Ошибка получения вопроса:', error)
      throw error
    }
  }
}

/**
 * API для работы с ответами
 */
export const answersApi = {
  /**
   * Получить ответы по вопросу
   */
  async getAnswersByQuestion(questionId) {
    try {
      const response = await apiClient.get(`${endpoints.lms.answers}?question=${questionId}`)
      return response.data.results || response.data
    } catch (error) {
      console.error('Ошибка получения ответов:', error)
      throw error
    }
  },

  /**
   * Создать ответ
   */
  async createAnswer(answerData) {
    try {
      const response = await apiClient.post(endpoints.lms.answers, answerData)
      return response.data
    } catch (error) {
      console.error('Ошибка создания ответа:', error)
      throw error
    }
  },

  /**
   * Обновить ответ
   */
  async updateAnswer(answerId, answerData) {
    try {
      const response = await apiClient.put(endpoints.lms.answerDetail(answerId), answerData)
      return response.data
    } catch (error) {
      console.error('Ошибка обновления ответа:', error)
      throw error
    }
  },

  /**
   * Удалить ответ
   */
  async deleteAnswer(answerId) {
    try {
      await apiClient.delete(endpoints.lms.answerDetail(answerId))
    } catch (error) {
      console.error('Ошибка удаления ответа:', error)
      throw error
    }
  }
} 