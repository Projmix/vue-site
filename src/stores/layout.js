import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiService from '../services/apiService';

export const useLayoutStore = defineStore("layout", {
    state: () => {
      const hostname = window.location.hostname;
      let cachedSiteLogoOnly = null;
      try {
        const cachedLayoutStr = localStorage.getItem(`site_layout_logo_${hostname}`); // Specific cache for logo
        const cachedTimeStr = localStorage.getItem(`site_layout_logo_time_${hostname}`);
        if (cachedLayoutStr && cachedTimeStr) {
          if (Date.now() - parseInt(cachedTimeStr) < 24 * 60 * 60 * 1000) { // 24 hours cache
            cachedSiteLogoOnly = JSON.parse(cachedLayoutStr);
          }
        }
      } catch (e) { 
        console.warn('[layout state] Error reading cached site_logo:', e); 
      }

      return {
        layout: null,
        logo: `/src/assets/images/${hostname}/logo1.png`, // Default fallback logo
        logo2: `/src/assets/images/${hostname}/logo2.png`, // Default fallback logo 2
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
        siteHeaderLogo: cachedSiteLogoOnly, // Initialized from cache or null
        objectId: null, // For the main object's purchase URL
      };
    },
    getters: {
      getLayout(state) {
        return state.layout;
      },
      getBackground(state) {
        return state.background;
      },
      getLogo(state) {
        // This getter can remain as a general purpose logo, e.g., for footer, if different from header
        const footerImages = state.layout?.site_footer_images || [];
        const logoImage = footerImages.find(img => img?.text?.toLowerCase().includes('logo'));
        return logoImage?.href || state.logo;
      },
      getCompanyLogoUrl(state) {
        const footerImages = state.layout?.site_footer_images || [];
        if (footerImages.length > 0 && footerImages[0]?.image) {
          return footerImages[0].image;
        }
        return state.logo; 
      },
      getCompanyLogoLinkDetails(state) {
        const footerImages = state.layout?.site_footer_images || [];
        if (footerImages.length > 0) {
          return {
            href: footerImages[0].href,
            target: footerImages[0].target,
            title: footerImages[0].title
          };
        }
        return { href: '/', target: '_self', title: 'Home' }; 
      },
      getAdditionalFooterLogos(state) {
        const footerImages = state.layout?.site_footer_images || [];
        if (footerImages.length > 1) {
          return footerImages.slice(1);
        }
        return [];
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
      },
      getSiteHeaderLogo(state) {
        if (state.siteHeaderLogo && typeof state.siteHeaderLogo === 'string' && state.siteHeaderLogo.trim() !== '') {
          console.log('[layout] getSiteHeaderLogo: Using state.siteHeaderLogo:', state.siteHeaderLogo);
          return state.siteHeaderLogo;
        }
        if (state.layout?.site_logo && typeof state.layout.site_logo === 'string' && state.layout.site_logo.trim() !== '') {
          console.log('[layout] getSiteHeaderLogo: Using state.layout.site_logo:', state.layout.site_logo);
          return state.layout.site_logo; // Action should set state.siteHeaderLogo
        }
        console.log('[layout] getSiteHeaderLogo: Using fallback state.logo:', state.logo);
        return state.logo || '/src/assets/images/default_logo_placeholder.png'; // Ultimate fallback
      },
      getObjectId(state) {
        return state.objectId;
      },
      getObjectPurchaseUrl(state) {
        if (!state.objectId) return '#'; // Return a safe link if no objectId
        const baseUrl = 'https://saleframe.24afisha.by'; // Consider making this configurable
        return `${baseUrl}/object/${state.objectId}`;
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
        // Не сбрасываем layoutFetchPromise здесь, если он уже выполняется для основного layout/slider
        // this.layoutFetchPromise = null;
        this.initialDataLoaded = false; 
      },
      async fetchLayout() {
        // Section 1: Ensure basic layout, site_logo, and slider data are loaded
        if (!this.layoutFetchPromise && !this.initialDataLoaded) {
            this.layoutFetchPromise = new Promise(async (resolve, reject) => {
                try {
                    console.log('[fetchLayout] Starting to fetch core layout data...');
                    const layoutData = await apiService.getLayout();
                    this.layout = layoutData;

                    if (layoutData && layoutData.site_logo) {
                        this.siteHeaderLogo = layoutData.site_logo;
                        try {
                            const hostname = window.location.hostname;
                            localStorage.setItem(`site_layout_logo_${hostname}`, JSON.stringify(this.siteHeaderLogo));
                            localStorage.setItem(`site_layout_logo_time_${hostname}`, Date.now().toString());
                        } catch (e) {
                            console.warn('[fetchLayout] Error caching site_logo:', e);
                        }
                    }

                    try {
                        const pagesHomeData = await apiService.getHomePageData();
                        if (pagesHomeData?.data?.topSlider?.items) {
                            this.siteSlider = pagesHomeData.data.topSlider.items.map(item => ({
                                title: item.title,
                                buttonText: item.buttonText,
                                url: item.url,
                                href: item.image.original
                            }));
                        } else {
                            this.siteSlider = [];
                        }
                    } catch (error) {
                        console.error('[fetchLayout] Error fetching slider data:', error);
                        this.siteSlider = [];
                    }

                    resolve(this.layout);
                } catch (error) {
                    console.error('[fetchLayout] Error fetching core layout/slider:', error);
                    this.siteSlider = [];
                    reject(error);
                } finally {
                    this.layoutFetchPromise = null;
                }
            });
        }

        try {
            if (this.layoutFetchPromise) await this.layoutFetchPromise;
        } catch (error) {
            console.warn('[fetchLayout] Error in core layout/slider fetch:', error);
        }

        // Section 2: Handle homepage specific events
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        
        if (isHomePage) {
            this.eventsLoading = true;
            
            try {
                const arenaHomeData = await apiService.getArenaHomeEvents();
                
                if (arenaHomeData?.data?.objects?.data?.[0]?.id) {
                    this.setObjectId(arenaHomeData.data.objects.data[0].id);
                }

                const organizerEventIds = await apiService.getOrganizerEventIds();
                const categorizedEvents = {};

                if (arenaHomeData?.data?.performances) {
                    for (const category of arenaHomeData.data.performances) {
                        if (category.slug === 'top') continue;

                        const filteredEvents = (category.events || []).filter(event => {
                            if (!event || !event.id) return false;

                            const numEventId = Number(event.id);
                            if (isNaN(numEventId)) return false;

                            const isInOrganizerList = organizerEventIds.has(numEventId);
                            const hasSessions = event.sessions && event.sessions.length > 0;
                            const isServiceFromArena = event.type === 'service';

                            return isInOrganizerList && (hasSessions || isServiceFromArena);
                        });

                        if (filteredEvents.length > 0) {
                            categorizedEvents[category.slug] = {
                                name: category.name,
                                slug: category.slug,
                                events: filteredEvents.slice(0, 8),
                                loading: false,
                                error: false
                            };
                        }
                    }
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
        return this.layout;
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
      },
      setObjectId(id) {
        this.objectId = id;
        console.log('[layoutStore] objectId set to:', this.objectId);
      }
    }
});
