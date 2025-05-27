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
        if (this.layoutFetchPromise) {
          return this.layoutFetchPromise;
        }
        
        this.layoutFetchPromise = new Promise(async (resolve, reject) => {
          try {
            // 1. Загружаем базовый layout
            this.layout = await apiService.getLayout();
            
            // 2. Загружаем данные для главной страницы
            const homeData = await apiService.getHomePageData();
            console.log('[fetchLayout] Получены данные слайдера:', homeData?.data?.topSlider);
            
            // Обработка данных слайдера
            if (homeData?.data?.topSlider?.items) {
                this.siteSlider = homeData.data.topSlider.items.map(item => ({
                    title: item.title,
                    buttonText: item.buttonText,
                    url: item.url,
                    href: item.image['1300x560']
                }));
                console.log('[fetchLayout] Обработанные данные слайдера:', this.siteSlider);
            } else {
                console.warn('[fetchLayout] Нет данных для слайдера');
                this.siteSlider = [];
            }

            // 3. Обработка событий для главной страницы
            const isHomePage = window.location.pathname === '/' || 
                             window.location.pathname === '/index.html';
            
            if (isHomePage) {
                this.eventsLoading = true;
                try {
                    const categorizedEvents = {};
                    if (homeData && homeData.performances) {
                        homeData.performances.forEach(category => {
                            if (category.viewType === 'top' || category.slug === 'top') return;
                            const eventsWithSessions = category.events?.filter(event => 
                                event.sessions && event.sessions.length > 0
                            ) || [];
                            if (eventsWithSessions.length > 0) {
                                categorizedEvents[category.slug] = {
                                    name: category.name,
                                    slug: category.slug,
                                    events: eventsWithSessions.slice(0, 8),
                                    loading: false,
                                    error: false
                                };
                            }
                        });
                    }
                    this.eventsByCategory = categorizedEvents;
                } catch (error) {
                    console.error('[fetchLayout] Error processing events:', error);
                    this.eventsByCategory = {};
                } finally {
                    this.eventsLoading = false;
                }
            }
            
            this.initialDataLoaded = true;
            resolve(this.layout);
          } catch (error) {
            console.error('[fetchLayout] Error:', error);
            this.siteSlider = [];
            this.initialDataLoaded = true;
            reject(error);
          }
        });
        
        return this.layoutFetchPromise;
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
