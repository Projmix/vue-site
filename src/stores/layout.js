import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiService from '../services/apiService';

export const useLayoutStore = defineStore("layout", {
    state: () => ({
        layout: null,
        logo: `/src/assets/images/${window.location.hostname}/logo1.png`, // Default fallback logo
        logo2: `/src/assets/images/${window.location.hostname}/logo2.png`, // Default fallback logo 2
        companyInfo: null, // Данные объекта компании из API
        companyInfoLoading: false,
        companyInfoError: null,
        categoriesData: {}, // { kino: { events: [], loading: true, error: false, name: '' }, ... },
        categories: [], // Список доступных категорий из API
        categoriesLoading: false,
        categoriesError: null,
        initialDataLoaded: false,
        layoutFetchPromise: null,
        eventsFromObjects: [],
        eventsLoading: true,
        eventsByCategory: {}, // События, распределенные по категориям
        siteSlider: [], // Для хранения данных слайдера
    }),
    getters: {
      getLayout(state) {
        return state.layout;
      },
      getBackground(state) {
        return state.background;
      },
      getLogo(state) {
        // Используем логотип из layout, если доступен, иначе fallback
        const footerImages = state.layout?.site_footer_images || [];
        const logoImage = footerImages.find(img => img?.text?.toLowerCase().includes('logo'));
        return logoImage?.href || state.logo;
      },
      getCompanyLogoUrl(state) {
        // Используем логотип из layout, если доступен
        const footerImages = state.layout?.site_footer_images || [];
        const logoImage = footerImages.find(img => img?.text?.toLowerCase().includes('logo'));
        return logoImage?.href || state.logo;
      },
      getCompanyInfo(state) {
        return state.companyInfo;
      },
      getCompanyInfoLoading(state) {
        return state.companyInfoLoading;
      },
      getCompanyInfoError(state) {
        return state.companyInfoError;
      },
      getLogo2(state) {
        return state.logo2;
      },
      filteredCategoriesData(state) {
        // Возвращаем ВСЕ категории (события могут быть пустыми)
        const filtered = {};
        Object.entries(state.categoriesData).forEach(([slug, cat]) => {
          filtered[slug] = cat;
        });
        return filtered;
      },
      isInitialDataLoaded(state) {
        return state.initialDataLoaded;
      },
      getEventCategories(state) {
        return state.categories.filter(cat => cat.slug !== 'top');
      },
      getSiteMenu(state) {
        return state.layout?.site_menu || [];
      },
      getSiteFooterLinks(state) {
        return state.layout?.site_footer_links || [];
      },
      getSiteFooterImages(state) {
        return state.layout?.site_footer_images || [];
      },
      getSiteSlider(state) {
        return state.siteSlider || [];
      },
      getHasSliderData(state) {
        return state.siteSlider && state.siteSlider.length > 0;
      },
      getEventsByCategory(state) {
        return state.eventsByCategory;
      },
      getHasAnyEvents(state) {
        return Object.values(state.eventsByCategory).some(
          category => category.events && category.events.length > 0
        );
      }
    },
    actions: {
      async fetchCompanyInfo() {
        console.log('[fetchCompanyInfo] This method is deprecated and will be removed in future versions');
        return null;
        
        /* Commented out as per requirement to remove this API call
        this.companyInfoLoading = true;
        this.companyInfoError = null;
        try {
          const companyId = import.meta.env.VITE_API_COMPANY_OBJECTS_ID;
          if (!companyId) throw new Error('VITE_API_COMPANY_OBJECTS_ID is not set');
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await fetch(`${apiUrl}/api/v3/pages/objects/${companyId}?${new URLSearchParams(apiService.getCommonParams())}`);
          const data = await response.json();
          this.companyInfo = data.object;
        } catch (e) {
          this.companyInfoError = e;
          this.companyInfo = null;
        } finally {
          this.companyInfoLoading = false;
        }
        */
      },
      async fetchCategories() {
        this.categoriesLoading = true;
        this.categoriesError = null;
        try {
          this.categories = await apiService.getEventCategories();
          console.log('[fetchCategories] Получены категории:', this.categories);
          return this.categories;
        } catch (e) {
          this.categoriesError = e;
          this.categories = [];
          console.error('[fetchCategories] Ошибка:', e);
          return [];
        } finally {
          this.categoriesLoading = false;
        }
      },
      initCategoriesData() {
        // Инициализация структуры только для отсутствующих
        // Используем категории из API вместо хардкода
        this.categories.filter(cat => cat.slug !== 'top').forEach(cat => {
          if (!this.categoriesData[cat.slug]) {
            this.categoriesData[cat.slug] = { 
              events: [], 
              loading: true, 
              error: false, 
              name: cat.name,
              id: cat.id
            };
          }
        });
      },
      saveCategoriesToCache() {
        if (Object.keys(this.categoriesData).length) {
          localStorage.setItem('categoriesData', JSON.stringify(this.categoriesData));
          localStorage.setItem('categoriesData_time', Date.now().toString());
          console.log('[categoriesData: SAVED TO CACHE]', JSON.parse(JSON.stringify(this.categoriesData)));
        }
      },
      loadCategoriesFromCache() {
        const cachedCategories = localStorage.getItem('categoriesData');
        const cachedTime = localStorage.getItem('categoriesData_time');
        if (cachedCategories && cachedTime && Date.now() - parseInt(cachedTime) < 24*60*60*1000) {
          const parsed = JSON.parse(cachedCategories);
          Object.keys(parsed).forEach(slug => {
            if (this.categoriesData[slug]) {
              this.categoriesData[slug] = parsed[slug];
            }
          });
          console.log('[categoriesData: FROM CACHE]', parsed);
          return true;
        }
        return false;
      },
      async fetchCategoryEvents(category) {
        if (!this.categoriesData[category.slug]) {
          this.initCategoriesData();
        }
        this.categoriesData[category.slug].loading = true;
        this.categoriesData[category.slug].error = false;
        
        try {
          const result = await apiService.getCategoryEvents(category.slug);
          // Берем только первые 8 событий для главной страницы
          this.categoriesData[category.slug].events = result.events.slice(0, 8);
          console.log('[fetchCategoryEvents] categoriesData:', JSON.parse(JSON.stringify(this.categoriesData)));
        } catch (error) {
          console.error(`Ошибка загрузки категории ${category.slug}:`, error);
          this.categoriesData[category.slug].error = true;
          this.categoriesData[category.slug].events = [];
        } finally {
          this.categoriesData[category.slug].loading = false;
        }
      },
      organizeEventsByCategory(events) {
        // Создаем объект для хранения событий по категориям
        const eventsByCategory = {};
        
        // Перебираем все события
        events.forEach(event => {
          // Если у события есть типы/категории
          if (event.types && event.types.length > 0) {
            event.types.forEach(type => {
              // Если такой категории еще нет в объекте, создаем ее
              if (!eventsByCategory[type.slug]) {
                eventsByCategory[type.slug] = {
                  name: type.name,
                  slug: type.slug,
                  events: [],
                  loading: false,
                  error: false
                };
              }
              
              // Добавляем событие в соответствующую категорию
              eventsByCategory[type.slug].events.push(event);
            });
          }
        });
        
        // Фильтруем только категории с событиями
        Object.keys(eventsByCategory).forEach(slug => {
          // Ограничиваем до 8 событий для главной
          eventsByCategory[slug].events = eventsByCategory[slug].events.slice(0, 8);
        });
        
        this.eventsByCategory = eventsByCategory;
      },
      // Метод для сброса кэша событий (полезно при навигации на главную)
      resetEventsCache() {
        console.log('[layoutStore] Сбрасываем кэш событий');
        this.eventsByCategory = {};
        this.eventsFromObjects = [];
      },
      async fetchLayout() {
        // Section 1: Ensure basic layout and slider data are loaded (can be cached by a promise during its run)
        if (!this.layout) { // Only fetch if layout isn't already populated
            if (!this.layoutFetchPromise) { // Only create a new promise if one isn't already running
                this.layoutFetchPromise = new Promise(async (resolve, reject) => {
                    try {
                        console.log('[fetchLayout] Initiating fetch for core layout and slider data...');
                        this.layout = await apiService.getLayout();
                        const pagesHomeData = await apiService.getHomePageData();
                        console.log('[fetchLayout] Raw pagesHomeData from /api/v3/pages/home (for slider):', pagesHomeData);
                        if (pagesHomeData?.data?.topSlider?.items) {
                            this.siteSlider = pagesHomeData.data.topSlider.items.map(item => ({
                                title: item.title,
                                buttonText: item.buttonText,
                                url: item.url,
                                href: item.image['1300x560']
                            }));
                        } else {
                            console.warn('[fetchLayout] No data for slider from /api/v3/pages/home');
                            this.siteSlider = [];
                        }
                        resolve(); // Core data fetched
                    } catch (error) {
                        console.error('[fetchLayout] Error fetching core layout/slider:', error);
                        this.siteSlider = []; // Ensure slider is empty on error
                        reject(error);
                    } finally {
                        // Clear the promise regardless of outcome, so next call to fetchLayout (if layout still null)
                        // or next full page load can re-attempt.
                        this.layoutFetchPromise = null;
                    }
                });
            }
            try {
                await this.layoutFetchPromise; // Wait if the promise is active
            } catch (error) {
                // Error is logged by the promise.
                console.warn('[fetchLayout] Proceeding after core layout/slider fetch error.');
            }
        }

        // Section 2: Handle homepage specific events
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';

        if (isHomePage) {
            console.log('[fetchLayout] Currently on Home page. Fetching/refreshing eventsByCategory...');
            this.eventsLoading = true;
            this.eventsByCategory = {}; // CRITICAL: Reset events for homepage to ensure fresh data
            try {
                const arenaHomeData = await apiService.getArenaHomeEvents();
                console.log('[fetchLayout] Raw arenaHomeData for categories from /api/v3/arena/home:', arenaHomeData);
                const organizerEventIds = await apiService.getOrganizerEventIds();
                console.log('[fetchLayout] Organizer Event IDs for filtering:', organizerEventIds);

                const categorizedEvents = {};
                if (arenaHomeData && arenaHomeData.data && arenaHomeData.data.performances) {
                    console.log('[fetchLayout] arenaHomeData.data.performances exists. Content:', JSON.parse(JSON.stringify(arenaHomeData.data.performances)));
                    arenaHomeData.data.performances.forEach(category => {
                        if (category.slug === 'top') return; // Skip only if slug is 'top'

                        console.log(`[fetchLayout] Processing category: ${category.name} (slug: ${category.slug}). Full category object:`, JSON.parse(JSON.stringify(category)));
                        console.log(`[fetchLayout] Category: ${category.name}. Original events count: ${category.events?.length || 0}. Events array:`, category.events ? JSON.parse(JSON.stringify(category.events.slice(0,5))) : 'No events array');
                        
                        const filteredEvents = category.events?.filter(event => {
                            const hasSessions = event.sessions && event.sessions.length > 0;
                            const isInOrganizerList = event.id && organizerEventIds.has(event.id);
                            if(!event.id) console.warn(`[fetchLayout] Event in category ${category.name} is missing an ID:`, event);
                            // Detailed per-event logs can be noisy; keep them commented unless debugging specific event issues.
                            // if(event.id && !isInOrganizerList) console.log(`[fetchLayout] Event ID ${event.id} (Name: ${event.name}) from category ${category.name} NOT in organizer list.`);
                            // if(event.id && isInOrganizerList && !hasSessions && event.type !== 'service') console.log(`[fetchLayout] Event ID ${event.id} (Name: ${event.name}) from category ${category.name} IS in organizer list BUT has NO sessions (and not a service).`);
                            
                            const isServiceFromArena = event.type === 'service';
                            return isInOrganizerList && (hasSessions || isServiceFromArena);
                        }) || [];
                        
                        if (filteredEvents.length > 0) {
                            console.log(`[fetchLayout] Category: ${category.name} has ${filteredEvents.length} events after filtering.`);
                            categorizedEvents[category.slug] = {
                                name: category.name,
                                slug: category.slug,
                                events: filteredEvents.slice(0, 8), 
                                loading: false,
                                error: false
                            };
                        } else {
                            console.log(`[fetchLayout] Category: ${category.name} has NO events after filtering.`);
                        }
                    });
                } else {
                    console.warn('[fetchLayout] arenaHomeData.data.performances is missing or empty. arenaHomeData:', arenaHomeData);
                }
                this.eventsByCategory = categorizedEvents;
                console.log('[fetchLayout] Filtered eventsByCategory for HomeView:', JSON.parse(JSON.stringify(this.eventsByCategory)));
            } catch (error) {
                console.error('[fetchLayout] Error processing and filtering events for homepage from arenaHomeData:', error);
                this.eventsByCategory = {}; // Ensure it's empty on error
            } finally {
                this.eventsLoading = false;
            }
        }
        // If not on home page, eventsByCategory is not touched here by this specific logic block,
        // preserving its state (e.g. from last Home visit or if cleared by other means).

        this.initialDataLoaded = true; // Mark that the overall process has completed for this call.
        return this.layout; // Return the (possibly null if fetch failed) layout.
      },

      async loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      },

      loadExternalScripts() {
        if (window._externalScriptsLoaded) return;
        window._externalScriptsLoaded = true;
        this.loadScript('/src/assets/js/jquery-2.2.4.min.js')
          .then(() => { console.log('Загружен: jquery-2.2.4.min.js'); return this.loadScript('/src/assets/js/plugins.js'); })
          .then(() => { console.log('Загружен: plugins.js'); return this.loadScript('/src/assets/js/popper.js'); })
          .then(() => { console.log('Загружен: popper.js'); return this.loadScript('/src/assets/js/bootstrap.min.js'); })
          .then(() => { console.log('Загружен: bootstrap.min.js'); return this.loadScript('/src/assets/vendor/slider/js/jquery.nivo.slider.js'); })
          .then(() => { console.log('Загружен: jquery.nivo.slider.js'); return this.loadScript('/src/assets/vendor/slider/home.js'); })
          .then(() => { console.log('Загружен: home.js'); return this.loadScript('/src/assets/js/jquery.meanmenu.min.js'); })
          .then(() => { console.log('Загружен: jquery.meanmenu.min.js'); return this.loadScript('/src/assets/js/jquery.scrollUp.min.js'); })
          .then(() => { console.log('Загружен: jquery.scrollUp.min.js'); 
          return this.loadScript('/src/assets/js/jquery.countdown.min.js'); })
          .then(() => { console.log('Загружен: jquery.countdown.min.js'); 
          return this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBtmXSwv4YmAKtcZyyad9W7D4AC08z0Rb4'); })
          .then(() => { console.log('Загружен: maps.googleapis.com'); return this.loadScript('/src/assets/js/main.js'); })
          .then(() => { console.log('Загружен: main.js'); })
          .catch(error => console.error('Ошибка загрузки скриптов', error));
      }
    }
});
