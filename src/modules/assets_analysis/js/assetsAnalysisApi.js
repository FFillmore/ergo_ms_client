import { apiClient } from '@/js/api/manager.js'
import { endpoints } from '@/js/api/endpoints.js'

/**
 * API модуль для работы с анализом активов
 */
class AssetsAnalysisApi {
    /**
     * Получить цены криптовалют
     * @returns {Promise} Промис с данными о ценах криптовалют
     */
    async getCryptoPrices() {
        try {
            const response = await apiClient.get(endpoints.assets_analysis.cryptoPrices, {}, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка загрузки цен криптовалют:', error)
            throw error
        }
    }

    /**
     * Получить курсы валют
     * @returns {Promise} Промис с данными о курсах валют
     */
    async getAssetsPrices() {
        try {
            const response = await apiClient.get(endpoints.assets_analysis.assetsPrices, {}, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка загрузки курсов валют:', error)
            throw error
        }
    }

    /**
     * Получить цены акций
     * @returns {Promise} Промис с данными о ценах акций
     */
    async getStockPrices() {
        try {
            const response = await apiClient.get(endpoints.assets_analysis.stockPrices, {}, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка загрузки цен акций:', error)
            throw error
        }
    }

    /**
     * Получить новости
     * @param {Object} params - Параметры запроса (page, page_size, startDate, endDate, coins, sentiment)
     * @returns {Promise} Промис с данными о новостях
     */
    async getNews(params = {}) {
        try {
            const response = await apiClient.get(endpoints.assets_analysis.news, params, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка загрузки новостей:', error)
            throw error
        }
    }

    /**
     * Выполнить команду (fetch_price, fetch_news, delete_all, delete_models)
     * @param {Object} payload - Данные команды
     * @returns {Promise} Промис с результатом выполнения команды
     */
    async executeCommand(payload) {
        try {
            const response = await apiClient.post(endpoints.assets_analysis.executeCommand, payload, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка выполнения команды:', error)
            throw error
        }
    }

    /**
     * Прогнозирование цен криптовалют
     * @param {Object} payload - Данные для прогноза (coin, trainDays, predictDays, endDate, useSentiment, sentimentWindow, sentimentFactor)
     * @returns {Promise} Промис с результатом прогноза
     */
    async predictCrypto(payload) {
        try {
            const response = await apiClient.post(endpoints.assets_analysis.predictCrypto, payload, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка прогнозирования криптовалюты:', error)
            throw error
        }
    }

    /**
     * Прогнозирование курсов валют
     * @param {Object} payload - Данные для прогноза (asset_pair, trainDays, predictDays, endDate, useSentiment)
     * @returns {Promise} Промис с результатом прогноза
     */
    async predictAsset(payload) {
        try {
            const response = await apiClient.post(endpoints.assets_analysis.predictAsset, payload, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка прогнозирования валюты:', error)
            throw error
        }
    }

    /**
     * Прогнозирование цен акций
     * @param {Object} payload - Данные для прогноза (ticker, trainDays, predictDays, endDate)
     * @returns {Promise} Промис с результатом прогноза
     */
    async predictStock(payload) {
        try {
            const response = await apiClient.post(endpoints.assets_analysis.predictStock, payload, false)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Ошибка прогнозирования акции:', error)
            throw error
        }
    }

    /**
     * Обновить цены (криптовалюты, валюты, акции)
     * @param {Object} options - Опции обновления
     * @param {Array} options.coins - Список криптовалют для обновления
     * @param {Array} options.assets - Список валютных пар для обновления
     * @param {Array} options.stocks - Список акций для обновления
     * @param {String} options.startDate - Начальная дата
     * @param {String} options.endDate - Конечная дата
     * @returns {Promise} Промис с результатом обновления
     */
    async updatePrices({ coins = [], assets = [], stocks = [], startDate, endDate }) {
        const payload = {
            command: 'fetch_price',
            startDate,
            endDate
        }

        if (coins.length > 0) {
            payload.coins = coins
        }

        if (assets.length > 0) {
            payload.assets = assets
        }

        if (stocks.length > 0) {
            payload.stocks = stocks
        }

        return this.executeCommand(payload)
    }

    /**
     * Обновить новости
     * @param {String} startDate - Начальная дата
     * @param {String} endDate - Конечная дата
     * @returns {Promise} Промис с результатом обновления
     */
    async updateNews(startDate, endDate) {
        const payload = {
            command: 'fetch_news',
            startDate,
            endDate
        }

        return this.executeCommand(payload)
    }

    /**
     * Удалить все данные
     * @returns {Promise} Промис с результатом удаления
     */
    async deleteAllData() {
        const payload = {
            command: 'delete_all'
        }

        return this.executeCommand(payload)
    }

    /**
     * Удалить модели прогнозов
     * @returns {Promise} Промис с результатом удаления
     */
    async deleteModels() {
        const payload = {
            command: 'delete_models'
        }

        return this.executeCommand(payload)
    }
}

// Создать и экспортировать синглтон-объект
export const assetsAnalysisApi = new AssetsAnalysisApi()

