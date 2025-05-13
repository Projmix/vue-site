import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import axios from "axios"
export const useLayoutStore = defineStore("layout", {
    state: () => ({
        layout: null,
        logo: `/src/assets/images/${window.location.hostname}/logo1.png`,
        logo2: `/src/assets/images/${window.location.hostname}/logo2.png`,
        companyInfo: null, // Данные объекта компании из API
        companyInfoLoading: false,
        companyInfoError: null,
        categoriesData: {}, // { kino: { events: [], loading: true, error: false, name: '' }, ... },
        categoriesToLoad: [
          { slug: 'kino', name: 'Кино' },
          { slug: 'theatre', name: 'Театр' },
          { slug: 'concert', name: 'Концерты' },
          { slug: 'sport', name: 'Спорт' },
          { slug: 'activ', name: 'Активный отдых' },
          { slug: 'kids', name: 'Детям' },
          { slug: 'vistavki', name: 'Выставки' },
          { slug: 'learn', name: 'Обучение' },
          { slug: 'circus', name: 'Цирк' },
          { slug: 'kvesty', name: 'Квесты' },
        ],
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
        if (state.layout && state.layout.someFieldContainingCategories) {
          return state.layout.someFieldContainingCategories.map(cat => ({
            slug: cat.slug,
            name: cat.name
          }));
        }
        return [];
      },
    },
    actions: {
      async fetchCompanyInfo() {
        this.companyInfoLoading = true;
        this.companyInfoError = null;
        try {
          const companyId = import.meta.env.VITE_API_COMPANY_OBJECTS_ID;
          if (!companyId) throw new Error('VITE_API_COMPANY_OBJECTS_ID is not set');
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await axios.get(`${apiUrl}/api/v3/pages/objects/${companyId}`);
          this.companyInfo = response.data.object;
        } catch (e) {
          this.companyInfoError = e;
          this.companyInfo = null;
        } finally {
          this.companyInfoLoading = false;
        }
      },
      initCategoriesData() {
        // Инициализация структуры только для отсутствующих
        this.categoriesToLoad.forEach(cat => {
          if (!this.categoriesData[cat.slug]) {
            this.categoriesData[cat.slug] = { events: [], loading: true, error: false, name: cat.name };
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
      async fetchCategoryEvents(category, axiosInstance, getCommonParams) {
        if (!this.categoriesData[category.slug]) {
          this.initCategoriesData();
        }
        this.categoriesData[category.slug].loading = true;
        this.categoriesData[category.slug].error = false;
        try {
          const params = {
            ...getCommonParams(),
            date: (window.moment ? window.moment().startOf('day').unix() : Math.floor(Date.now() / 1000)),
            ignoreEndTime: 0,
          };
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/${category.slug}`;
          console.log('[fetchCategoryEvents] Запрос:', apiUrl, params);
          const response = await axiosInstance.get(apiUrl, { params });
          console.log('[fetchCategoryEvents] Ответ:', response.data);
          let events = [];
          if (response.data.data?.currentDate?.length) {
            events = events.concat(response.data.data.currentDate);
          }
          if (response.data.data?.month?.length) {
            response.data.data.month.forEach(monthData => {
              if (monthData.performances?.length) {
                events = events.concat(monthData.performances);
              }
            });
          }
          const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
          this.categoriesData[category.slug].events = uniqueEvents.slice(0, 8);
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
          const loadedFromCache = this.loadCategoriesFromCache();
          try {
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/pages/layout`;
            const params = {
              lang: import.meta.env.VITE_API_LANG,
              jsonld: import.meta.env.VITE_API_JSONLD,
              onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
              domain: import.meta.env.VITE_API_DOMAIN,
              distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
            };
            const { data } = await axios.get(apiUrl, { params });
            this.layout = data;
            if (!loadedFromCache) {
              this.initCategoriesData();
              const categoryFetchPromises = this.categoriesToLoad.map(cat =>
                this.fetchCategoryEvents(cat, axios, () => params)
              );
              await Promise.all(categoryFetchPromises);
              this.initialDataLoaded = true;
              this.saveCategoriesToCache();
            } else {
              this.initialDataLoaded = true;
            }
            resolve(this.layout);
          } catch (error) {
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
          // return this.loadScript('/src/assets/js/jquery.counterup.min.js'); })
          // .then(() => { console.log('Загружен: jquery.counterup.min.js');
          // return this.loadScript('/src/assets/js/waypoints.min.js'); })
          // .then(() => { console.log('Загружен: waypoints.min.js');
          return this.loadScript('/src/assets/js/jquery.countdown.min.js'); })
          .then(() => { console.log('Загружен: jquery.countdown.min.js'); 
          //   return this.loadScript('/src/assets/js/isotope.pkgd.min.js'); })
          // .then(() => { console.log('Загружен: isotope.pkgd.min.js'); 
          // return this.loadScript('/src/assets/js/jquery.magnific-popup.min.js'); })
          // .then(() => { console.log('Загружен: jquery.magnific-popup.min.js'); 
          return this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBtmXSwv4YmAKtcZyyad9W7D4AC08z0Rb4'); })
          .then(() => { console.log('Загружен: maps.googleapis.com'); return this.loadScript('/src/assets/js/main.js'); })
          .then(() => { console.log('Загружен: main.js'); })
          .catch(error => console.error('Ошибка загрузки скриптов', error));
          

      }
    }
});
