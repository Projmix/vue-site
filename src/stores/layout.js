import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiService from '../services/apiService';

export const useLayoutStore = defineStore("layout", {
    state: () => ({
        layout: null,
        logo: `/src/assets/images/${window.location.hostname}/logo1.png`,
        logo2: `/src/assets/images/${window.location.hostname}/logo2.png`,
        companyInfo: null, // Данные объекта компании из API
        companyInfoLoading: false,
        companyInfoError: null,
        categoriesData: {}, // { kino: { events: [], loading: true, error: false, name: '' }, ... },
        categories: [], // Список доступных категорий из API
        categoriesLoading: false,
        categoriesError: null,
        initialDataLoaded: false,
        layoutFetchPromise: null,
    }),
    getters: {
      getLayout(state) {
        return state.layout;
      },
      getBackground(state) {
        return state.background;
      },
      getLogo(state) {
        // Если companyInfo загружен — используем его логотип
        return state.companyInfo?.logoUrl?.original || state.logo;
      },
      getCompanyLogoUrl(state) {
        return state.companyInfo?.logoUrl?.original || '';
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
      }
    },
    actions: {
      async fetchCompanyInfo() {
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
      async fetchLayout() {
        if (this.layoutFetchPromise) {
          return this.layoutFetchPromise;
        }
        
        this.layoutFetchPromise = new Promise(async (resolve, reject) => {
          try {
            // 1. Сначала загружаем layout для получения меню и footer
            this.layout = await apiService.getLayout();
            
            // 2. Затем загружаем категории с API
            await this.fetchCategories();
            
            // 3. Затем пробуем загрузить из кеша или заново
            const loadedFromCache = this.loadCategoriesFromCache();
            
            if (!loadedFromCache) {
              this.initCategoriesData();
              
              // Загружаем события для каждой категории
              const categoryFetchPromises = this.categories
                .filter(cat => cat.slug !== 'top')
                .map(cat => this.fetchCategoryEvents(cat));
              
              await Promise.all(categoryFetchPromises);
              this.saveCategoriesToCache();
            }
            
            this.initialDataLoaded = true;
            resolve(this.layout);
          } catch (error) {
            console.error('[fetchLayout] Ошибка:', error);
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
