import axios from 'axios';

/**
 * Централизованный сервис для работы с API
 */
class ApiService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL;
    
    // Инициализация axios с базовыми настройками
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      withCredentials: false,
    });
    
    // Cache for API calls
    this.homePageDataPromise = null;
  }
  
  /**
   * Получение общих параметров для запросов API
   * @returns {Object} Объект с общими параметрами
   */
  getCommonParams() {
    // Используем текущий hostname без протокола и слеша
    const currentDomain = window.location.hostname;
    
    return {
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      onlyDomain: 1,
      domain: currentDomain,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    };
  }
  
  /**
   * Получение списка доступных категорий событий
   * @returns {Promise} Промис с результатом запроса
   */
  async getEventCategories() {
    try {
      const response = await this.axiosInstance.get('/api/v3/mobile/afisha/category', {
        params: this.getCommonParams()
      });
      return response.data.types || [];
    } catch (error) {
      console.error('API error: getEventCategories', error);
      throw error;
    }
  }
  
  /**
   * Получение событий определенной категории
   * @param {String} categorySlug - Слаг категории (kino, theatre, etc.)
   * @returns {Promise} Промис с результатом запроса
   */
  async getCategoryEvents(categorySlug) {
    try {
      // Если categorySlug не указан, используем 'theatre' по умолчанию
      const slug = categorySlug || 'theatre';
      
      const params = {
        ...this.getCommonParams(),
        date: Math.floor(Date.now() / 1000), // текущий timestamp
        ignoreEndTime: 1,
        objectsIds: 0,
      };
      
      const response = await this.axiosInstance.get(`/api/v3/mobile/afisha/${slug}`, { params });
      
      // Извлекаем события из всех секций согласно API
      let events = [];
      
      // 1. Приоритетно берем данные из month.performances
      if (response.data.data?.month?.length) {
        response.data.data.month.forEach(monthData => {
          if (monthData.performances?.length) {
            events = events.concat(monthData.performances);
          }
        });
      }
      
      // 2. Добавляем события из currentDate
      if (response.data.data?.currentDate?.length) {
        events = events.concat(response.data.data.currentDate);
      }
      
      // 3. Добавляем события из weekend
      if (response.data.data?.weekend?.length) {
        response.data.data.weekend.forEach(dayData => {
          if (dayData.performances?.length) {
            events = events.concat(dayData.performances);
          }
        });
      }
      
      // 4. Добавляем события из soon
      if (response.data.data?.soon?.length) {
        response.data.data.soon.forEach(monthData => {
          if (monthData.performances?.length) {
            events = events.concat(monthData.performances);
          }
        });
      }
      
      // Удаляем дубликаты по ID и возвращаем результат
      const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
      
      return {
        events: uniqueEvents,
        categoryInfo: response.data.type
      };
    } catch (error) {
      console.error(`API error: getCategoryEvents for ${categorySlug}`, error);
      throw error;
    }
  }
  
  /**
   * Получение всех событий из API объектов
   * @returns {Promise} Промис с результатом запроса
   */
  async fetchAllEvents() {
    try {
      const companyId = import.meta.env.VITE_API_COMPANY_OBJECTS_ID;
      if (!companyId) throw new Error('VITE_API_COMPANY_OBJECTS_ID is not set');
      
      const params = this.getCommonParams();
      const response = await this.axiosInstance.get(`/api/v3/pages/objects/${companyId}`, { params });
      
      return response.data?.more || [];
    } catch (error) {
      console.error('API error: fetchAllEvents', error);
      throw error;
    }
  }
  
  /**
   * Получение детальной информации о событии
   * @param {Number|String} eventId - ID события
   * @returns {Promise} Промис с результатом запроса
   */
  async getEventDetails(eventId) {
    try {
      const params = {
        ...this.getCommonParams(),
        time: Math.floor(Date.now() / 1000),
      };
      
      const response = await this.axiosInstance.get(`/api/v3/arena/events/${eventId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`API error: getEventDetails for ${eventId}`, error);
      throw error;
    }
  }
  
  /**
   * Получение сеансов для события на определенную дату
   * @param {Number|String} eventId - ID события
   * @param {String} date - Дата в формате YYYY-MM-DD
   * @returns {Promise} Промис с результатом запроса, содержащий все данные ответа API
   */
  async getEventSessions(eventId, date) {
    try {
      // Преобразуем дату в timestamp
      const timestamp = new Date(date).getTime() / 1000;
      
      const params = {
        ...this.getCommonParams(),
        time: timestamp,
      };
      
      console.log(`[apiService] Requesting sessions for event ${eventId} on ${date} (timestamp: ${timestamp})`);
      const response = await this.axiosInstance.get(`/api/v2/schedule/events/${eventId}`, { params });
      
      // Return the whole response structure to process in component
      return response.data;
    } catch (error) {
      console.error(`API error: getEventSessions for ${eventId} on ${date}`, error);
      throw error;
    }
  }
  
  /**
   * Получение URL для покупки билетов на сеанс
   * @param {Number|String} sessionId - ID сеанса
   * @returns {String} URL для покупки билетов
   */
  getTicketUrl(sessionId) {
    return `https://saleframe.24afisha.by/?lang=${import.meta.env.VITE_API_LANG}&sid=${sessionId}&distributor_company_id=${import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID}`;
  }
  
  /**
   * Получение списка новостей
   * @param {Object} options - Параметры запроса
   * @param {Number} options.page - Номер страницы
   * @param {Number} options.perPage - Количество новостей на странице
   * @returns {Promise} Промис с результатом запроса
   */
  async getPosts({ page = 1, perPage = 9 } = {}) {
    try {
      const params = {
        ...this.getCommonParams(),
        expand: 'sessions',
        page,
        perPage
      };
      
      const response = await this.axiosInstance.get('/api/v3/arena/posts', { params });
      return {
        posts: response.data.posts || [],
        totalPages: response.data.posts_last_page || 1
      };
    } catch (error) {
      console.error(`API error: getPosts page=${page}, perPage=${perPage}`, error);
      throw error;
    }
  }
  
  /**
   * Получение детальной информации о новости
   * @param {String} slug - Слаг новости
   * @returns {Promise} Промис с результатом запроса
   */
  async getPostDetails(slug) {
    try {
      const params = this.getCommonParams();
      const response = await this.axiosInstance.get(`/api/v3/arena/posts/${slug}`, { params });
      return response.data.posts;
    } catch (error) {
      console.error(`API error: getPostDetails for ${slug}`, error);
      throw error;
    }
  }
  
  /**
   * Получение информации о макете сайта (меню, футер и т.д.)
   * @returns {Promise} Промис с результатом запроса
   */
  async getLayout() {
    try {
      const response = await this.axiosInstance.get('/api/v3/pages/layout', {
        params: this.getCommonParams()
      });
      return response.data;
    } catch (error) {
      console.error('API error: getLayout', error);
      throw error;
    }
  }
  
  /**
   * Получение данных страницы по слагу
   * @param {String} slug - Слаг страницы
   * @returns {Promise} Промис с результатом запроса
   */
  async getPageBySlug(slug) {
    try {
      const params = {
        ...this.getCommonParams(),
        expand: 'sessions'
      };
      
      const response = await this.axiosInstance.get(`/api/v3/arena/page/${slug}`, { params });
      return response.data;
    } catch (error) {
      console.error(`API error: getPageBySlug for ${slug}`, error);
      throw error;
    }
  }
  
  /**
   * Получение данных для главной страницы из endpoint /api/v3/arena/home
   * @returns {Promise} Промис с результатом запроса
   */
  async getHomePageData() {
    // Use cached promise if exists (prevents duplicate requests)
    if (this.homePageDataPromise) {
      console.log('[apiService] getHomePageData: Используем кэшированные данные');
      return this.homePageDataPromise;
    }
    
    // Create a new promise
    this.homePageDataPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('[apiService] getHomePageData: Запрос данных для главной страницы');
        const params = {
          ...this.getCommonParams(),
          expand: 'sessions'
        };
        
        const response = await this.axiosInstance.get('/api/v3/arena/home', { params });
        console.log('[apiService] getHomePageData: Данные получены');
        resolve(response.data);
      } catch (error) {
        console.error('API error: getHomePageData', error);
        this.homePageDataPromise = null; // Reset cache on error
        reject(error);
      }
    });
    
    return this.homePageDataPromise;
  }
  
  /**
   * Получение списка событий с сессиями, сгруппированных по категориям
   * @returns {Promise} Промис с объектом категорий и соответствующими событиями
   */
  async getEventsWithSessionsByCategory() {
    try {
      console.log('[apiService] getEventsWithSessionsByCategory: Запрос событий');
      const data = await this.getHomePageData();
      const categorizedEvents = {};
      
      // Проверяем наличие performances в данных
      if (data && data.performances) {
        // Обрабатываем каждую категорию
        data.performances.forEach(category => {
          // Пропускаем категорию "top" (рекомендуемые)
          if (category.viewType === 'top' || category.slug === 'top') {
            return;
          }
          
          // Фильтруем события с непустыми sessions
          const eventsWithSessions = category.events?.filter(event => 
            event.sessions && event.sessions.length > 0
          ) || [];
          
          // Если есть события с сессиями, добавляем категорию
          if (eventsWithSessions.length > 0) {
            categorizedEvents[category.slug] = {
              name: category.name,
              slug: category.slug,
              events: eventsWithSessions,
              loading: false,
              error: false
            };
          }
        });
      }
      
      console.log('[apiService] getEventsWithSessionsByCategory: Событий получено:', Object.keys(categorizedEvents).length);
      return categorizedEvents;
    } catch (error) {
      console.error('API error: getEventsWithSessionsByCategory', error);
      throw error;
    }
  }
  
  /**
   * Очистка кэша API запросов
   * @param {String} cacheKey - ключ кэша для очистки (если не указан, очищаются все кэши)
   */
  clearCache(cacheKey = null) {
    if (cacheKey === 'home' || cacheKey === null) {
      console.log('[apiService] clearCache: Очищаем кэш данных главной страницы');
      this.homePageDataPromise = null;
    }
  }
}

// Экспортируем экземпляр сервиса
export default new ApiService(); 