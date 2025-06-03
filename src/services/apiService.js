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

    // Cache for organizer's event IDs
    this.organizerEventIdsCache = null;
    this.organizerEventIdsCacheTime = 0;
    this.ORGANIZER_EVENT_IDS_CACHE_DURATION = 8 * 60 * 60 * 1000; // 8 hours
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
      domain: "belorusneft.24afisha.by",
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
   * Получение событий определенной категории (теперь только из sync/data)
   * @param {String} categorySlug - Слаг категории
   * @returns {Promise<Object>} Промис с объектом, содержащим события и информацию о категории
   */
  async getCategoryEvents(categorySlug) {
    try {
      console.log(`[apiService] Getting events for category: ${categorySlug} from organizer data`);
      
      const organizerEventsMap = await this.getOrganizerEventsMap();
      // Теперь allOrganizerEvents будет содержать полные объекты item (с performance, sessions, services)
      const allOrganizerEvents = Array.from(organizerEventsMap.values());

      console.log('[apiService] All organizer events count:', allOrganizerEvents.length);
      if (allOrganizerEvents.length > 0) {
        console.log('[apiService] First full item from allOrganizerEvents for getCategoryEvents:', JSON.stringify(allOrganizerEvents[0], null, 2));
      }

      const filteredEvents = allOrganizerEvents.filter(item => {
        // Теперь 'item' - это полный объект, а 'item.performance' - это данные афиши
        if (!item.performance || typeof item.performance.id === 'undefined') {
            console.warn('[apiService] Invalid item structure or missing performance data:', item);
            return false;
        }
        const eventPerformance = item.performance; // Это объект афиши (бывший 'event')
        
        const matchesCategory = eventPerformance.types?.some(type => type.slug === categorySlug);
        
        // Используем простую проверку !deletedAt для performance, sessions, services
        const isActiveEvent = !eventPerformance.deletedAt;
        const hasActiveSessions = item.sessions?.some(session => !session.deletedAt);
        const hasActiveServices = item.services?.some(service => !service.deletedAt);

        // Обновленный фильтр: событие активно И соответствует категории И (ИМЕЕТ активные сессии ИЛИ активные услуги)
        // Это более строгий фильтр, чем ваш предыдущий `isActiveEvent && matchesCategory`
        // Если вы хотите вернуться к старому поведению, где наличие сессий/услуг не важно для отображения в категории,
        // то используйте: const shouldEventPass = isActiveEvent && matchesCategory;
        const shouldEventPass = isActiveEvent && matchesCategory && (hasActiveSessions || hasActiveServices);
        
        // Логирование для отладки
        if (eventPerformance.id === 3793627 || eventPerformance.id === 3796698 || categorySlug === 'kids' ) {
             console.log(`[apiService] Event ID ${eventPerformance.id} ('${eventPerformance.name}') for category '${categorySlug}': 
               Matches Category: ${matchesCategory}, 
               Event Active (performance.deletedAt: ${eventPerformance.deletedAt}): ${isActiveEvent}, 
               Has Active Sessions (count ${item.sessions?.length}): ${hasActiveSessions},
               Has Active Services (count ${item.services?.length}): ${hasActiveServices},
               SHOULD PASS (strict): ${shouldEventPass}`);
        }
        
        return shouldEventPass; 
      });

      console.log(`[apiService] Filtered events for ${categorySlug}. Count:`, filteredEvents.length);
      if (filteredEvents.length > 0) {
        console.log('[apiService] First filtered full item for EventsView:', JSON.stringify(filteredEvents[0], null, 2));
      }


      // Получаем актуальную информацию о категории
      let categoryInfo = {
        name: categorySlug, // Имя по умолчанию, если не найдено
        slug: categorySlug,
        seoTitle: `События категории ${categorySlug}`,
        seoDescription: `Афиша событий категории ${categorySlug}`
      };
      
      return {
        events: filteredEvents, // Возвращаем отфильтрованные события
        categoryInfo: categoryInfo // Возвращаем информацию о категории
      };
    } catch (error) {
      console.error(`[apiService] Error in getCategoryEvents for ${categorySlug}:`, error);
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
      
      const response = await this.axiosInstance.get(`/api/v3/pages/events/${eventId}`, { params });
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
   * Получение URL для покупки услуги (абонемента)
   * @param {Number|String} objectId - ID объекта, предоставляющего услугу
   * @param {Number|String} serviceId - ID услуги (абонемента)
   * @returns {String} URL для покупки услуги
   */
  getServicePurchaseUrl(objectId, serviceId) {
    const lang = import.meta.env.VITE_API_LANG || 'ru';
    return `https://saleframe.24afisha.by/?oid=${objectId}&seid=${serviceId}&lang=${lang}`;
  }
  
  /**
   * Получение URL для покупки товара
   * @param {Number|String} institutionId - ID организации (часто совпадает с objectId для товаров)
   * @param {Number|String} itemId - ID товара
   * @returns {String} URL для покупки товара
   */
  getProductPurchaseUrl(institutionId, itemId) {
    const lang = import.meta.env.VITE_API_LANG || 'ru';
    return `https://saleframe.24afisha.by/item?oid=${institutionId}&iid=${itemId}&lang=${lang}`;
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
   * Получение данных для главной страницы из endpoint /api/v3/pages/home
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
        
        const response = await this.axiosInstance.get('/api/v3/pages/home', { params });
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
   * Получение данных для категорий событий на главной странице из endpoint /api/v3/arena/home
   * @returns {Promise} Промис с результатом запроса (обычно содержит .performances)
   */
  async getArenaHomeEvents() {
    try {
      console.log('[apiService] getArenaHomeEvents: Запрос данных для категорий событий с /api/v3/arena/home');
      const params = {
        ...this.getCommonParams(),
        expand: 'sessions' // Ensure sessions are expanded if needed for filtering later
      };
      
      const response = await this.axiosInstance.get('/api/v3/arena/home', { params });
      if (response.data?.data?.objects?.data?.[0]) {
        console.log('[apiService] getArenaHomeEvents: Найден объект:', response.data.data.objects.data[0]);
      } else {
        console.warn('[apiService] getArenaHomeEvents: Структура ответа:', {
          hasData: !!response.data,
          hasNestedData: !!response.data?.data,
          hasObjects: !!response.data?.data?.objects,
          objectsData: response.data?.data?.objects?.data
        });
      }
      return response.data;
    } catch (error) {
      console.error('API error: getArenaHomeEvents', error);
      throw error;
    }
  }
  
  /**
   * Получение списка событий с сессиями, сгруппированных по категориям
   * ВАЖНО: Этот метод теперь будет использовать getArenaHomeEvents для получения исходных данных,
   * а затем getOrganizerEventIds для их фильтрации в layoutStore.
   * Логика самого getEventsWithSessionsByCategory может быть упрощена или удалена из apiService,
   * так как фильтрация теперь будет происходить в layoutStore.
   * Пока оставим его как есть, но его использование может быть пересмотрено.
   * @returns {Promise} Промис с объектом категорий и соответствующими событиями
   */
  async getEventsWithSessionsByCategory() {
    try {
      console.warn('[apiService] getEventsWithSessionsByCategory: This method is likely superseded by logic in layoutStore using getArenaHomeEvents and getOrganizerEventIds. Review its usage.');
      // Эта логика теперь будет дублироваться или конфликтовать с layoutStore
      const data = await this.getHomePageData(); // Использует /pages/home, НЕ /arena/home
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

  /**
   * Получение ID событий организатора с кэшированием
   * @returns {Promise<Set<Number>>} Промис с множеством ID событий организатора
   */
  async getOrganizerEventIds() {
    const now = Date.now();
    if (this.organizerEventIdsCache && (now - this.organizerEventIdsCacheTime < this.ORGANIZER_EVENT_IDS_CACHE_DURATION)) {
      console.log('[apiService] getOrganizerEventIds: Using cached organizer event IDs. Count:', this.organizerEventIdsCache.size);
      return this.organizerEventIdsCache;
    }

    try {
      const apiKey = import.meta.env.VITE_API_SECRET_KEY;
      const companyId = import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID;

      if (!apiKey) {
        console.error('[apiService] getOrganizerEventIds: VITE_API_SECRET_KEY is not set.');
        throw new Error('VITE_API_SECRET_KEY is not set');
      }
      if (!companyId) {
        // VITE_API_DISTRIBUTOR_COMPANY_ID is used in getCommonParams, but good to check if specifically needed here
        console.warn('[apiService] getOrganizerEventIds: VITE_API_DISTRIBUTOR_COMPANY_ID might be needed directly if not in common params for this endpoint.');
      }

      console.log('[apiService] getOrganizerEventIds: Fetching new organizer event IDs.');
      const syncParams = { key: apiKey };
      if (companyId) {
        syncParams.company_id = companyId;
      }

      console.log('[apiService] getOrganizerEventIds: Fetching new organizer event IDs with params:', syncParams);
      const response = await this.axiosInstance.get('/api/v2/sync/data/performances', {
        params: syncParams
      });

      console.log('[apiService] getOrganizerEventIds: Raw response from sync API:', JSON.parse(JSON.stringify(response.data))); // Log raw sync data

      let eventIds = new Set();
      // Adapt based on the actual structure of response.data for this endpoint
      // Common patterns: response.data (array of events), response.data.data (array of events)
      const eventsArray = response.data?.data || response.data; 

      if (Array.isArray(eventsArray)) {
        console.log('[apiService] getOrganizerEventIds: eventsArray from sync API (first item if exists):', eventsArray.length > 0 ? JSON.parse(JSON.stringify(eventsArray[0])) : 'empty array');
        eventsArray.forEach((event, index) => {
          // Log the structure of each event item from sync API
          if (index < 3) { // Log first 3 items to avoid excessive logging
             console.log(`[apiService] getOrganizerEventIds: Sync event item [${index}]:`, JSON.parse(JSON.stringify(event)));
          }
          if (event && typeof event.id !== 'undefined') {
            eventIds.add(event.id);
          } else if (event && typeof event.performance_id !== 'undefined') { // Common alternative
            console.log(`[apiService] getOrganizerEventIds: Found event.performance_id: ${event.performance_id}`);
            eventIds.add(event.performance_id);
          } else if (event && event.performance && typeof event.performance.id !== 'undefined') { // Another common alternative
            console.log(`[apiService] getOrganizerEventIds: Found event.performance.id: ${event.performance.id}`);
            eventIds.add(event.performance.id);
          } else {
            if(index < 3) console.warn(`[apiService] getOrganizerEventIds: Event item [${index}] from sync API is missing an identifiable ID. Structure:`, JSON.parse(JSON.stringify(event)));
          }
        });
      } else {
        console.warn('[apiService] getOrganizerEventIds: Unexpected response structure for organizer events. Data:', response.data);
      }
      
      this.organizerEventIdsCache = eventIds;
      this.organizerEventIdsCacheTime = now;
      console.log('[apiService] getOrganizerEventIds: Fetched and cached new organizer event IDs. IDs:', Array.from(eventIds), 'Count:', eventIds.size);
      return eventIds;

    } catch (error) {
      console.error('API error: getOrganizerEventIds', error);
      if (this.organizerEventIdsCache) {
         console.warn('[apiService] getOrganizerEventIds: Failed to fetch new IDs, returning stale cache. Count:', this.organizerEventIdsCache.size);
         return this.organizerEventIdsCache; // Return stale cache if fetch fails
      }
      return new Set(); // Return empty set on error if no cache
    }
  }

  /**
   * Получение и кэширование всех событий организатора с их категориями
   * @returns {Promise<Map>} Карта событий организатора с их данными
   */
  async getOrganizerEventsMap() {
    try {
      // Пока уберем использование кэша для диагностики
      // if (this.organizerEventsCache && 
      //     (Date.now() - this.organizerEventIdsCacheTime < this.ORGANIZER_EVENT_IDS_CACHE_DURATION)) {
      //   console.log('[apiService] Using cached organizer events map. Size:', this.organizerEventsCache.size);
      //   return this.organizerEventsCache;
      // }
      console.log('[apiService] Always fetching new organizer events map (cache disabled for diagnostics).');

      const apiKey = import.meta.env.VITE_API_SECRET_KEY;
      const companyId = import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID;

      if (!apiKey) {
        throw new Error('VITE_API_SECRET_KEY is not set');
      }

      console.log('[apiService] Fetching organizer events data');
      const response = await this.axiosInstance.get('/api/v2/sync/data/performances', {
        params: {
          key: apiKey,
          company_id: companyId
        }
      });

      // Создаем Map для быстрого доступа к данным события
      const eventsMap = new Map();
      
      if (response.data?.data) {
        console.log('[apiService] Processing raw sync data. Total items:', response.data.data.length);
        
        response.data.data.forEach((item, index) => {
          let eventId = null;

          // Основная информация о событии (афише) находится в item.performance
          if (item.performance && typeof item.performance.id !== 'undefined') {
            eventId = Number(item.performance.id);
            // Сохраняем весь 'item', который включает 'performance', 'sessions', 'services'
            eventsMap.set(eventId, item); 
            console.log(`[apiService] Adding to eventsMap - ID: ${eventId}, Name: ${item.performance.name}, Storing FULL item.`);
          } else if (item.performance_id && item.name) {
            // Фоллбэк, если структура другая (менее вероятно для ваших данных)
            eventId = Number(item.performance_id);
            // В этом случае 'item' сам по себе является данными события без вложенного 'performance'
            // но с прямыми 'sessions' и 'services'. Мы должны убедиться, что 'types' также доступны.
            eventsMap.set(eventId, { 
                performance: { // Оборачиваем в performance для консистентности с getCategoryEvents
                    id: eventId,
                    name: item.name,
                    types: item.types || [],
                    deletedAt: item.deletedAt || null
                    // Добавьте другие поля performance, если они есть на верхнем уровне item
                },
                sessions: item.sessions || [],
                services: item.services || []
            });
            console.log(`[apiService] Adding to eventsMap (fallback structure) - ID: ${eventId}, Name: ${item.name}, Storing constructed item.`);
          } else {
            console.warn(`[apiService] Could not determine eventId for item at index ${index}:`, JSON.stringify(item, null, 2));
          }
        });
      }

      console.log('[apiService] Created events map with size:', eventsMap.size);
      console.log('[apiService] Event IDs in map:', Array.from(eventsMap.keys()));
      console.log('[apiService] Events map first entry (full item):', 
        eventsMap.size > 0 ? 
        JSON.stringify([...eventsMap.values()][0], null, 2) : 
        'No events'
      );

      // Сохраняем в кэш
      // this.organizerEventsCache = eventsMap;
      this.organizerEventIdsCacheTime = Date.now();

      return eventsMap;
    } catch (error) {
      console.error('[apiService] Error fetching organizer events:', error);
      throw error;
    }
  }

  /**
   * Получение CSS темы по hostname
   * @param {String} hostname - Текущий hostname сайта
   * @returns {Promise<String|null>} Промис с CSS строкой или null в случае ошибки или пустого ответа
   */
  async getThemeCss(hostname) {
    if (!hostname) {
      console.warn('[apiService] getThemeCss: Hostname is required.');
      return null;
    }
    try {
      console.log(`[apiService] Fetching theme CSS for ${hostname}`);
      const response = await this.axiosInstance.get(`/api/v3/themes/${hostname}.css`, {
        responseType: 'text', // Важно для получения CSS как строки
        transformResponse: [(data) => data] // Предотвращает парсинг JSON
      });

      if (typeof response.data === 'string' && response.data.trim() !== '') {
        console.log(`[apiService] Successfully fetched theme CSS for ${hostname}`);
        return response.data;
      } else {
        console.warn(`[apiService] getThemeCss: Received empty or non-string response for ${hostname}.css. Data:`, response.data);
        // Не бросаем ошибку, чтобы App.vue мог попробовать кэш, если API вернул 200, но с пустым телом
        return null; 
      }
    } catch (error) {
      console.error(`[apiService] Error fetching theme CSS for ${hostname}.css:`, error.message);
      if (error.response && error.response.status === 404) {
        console.warn(`[apiService] Theme CSS not found (404) for ${hostname}.css`);
      }
      // Бросаем ошибку, чтобы App.vue обработал ее (например, загрузкой из кэша)
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export default new ApiService(); 