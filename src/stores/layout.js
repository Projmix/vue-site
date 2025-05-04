import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import axios from "axios"
export const useLayoutStore = defineStore("layout", {
    state: () => ({
        layout: null,
        logo: `/src/assets/images/${window.location.hostname}/logo1.png`,
        logo2: `/src/assets/images/${window.location.hostname}/logo2.png`,
        categoriesData: {}, // { kino: { events: [], loading: true, error: false, name: '' }, ... }
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
        ]
    }),
    getters: {
      getLayout(state){
        return state.layout
      },
      getBackground(state){
        return state.background
      },
      getLogo(state){
        return state.logo
      },
      getLogo2(state){
        return state.logo2
      },
      filteredCategoriesData(state) {
        // Только категории с событиями
        const filtered = {};
        Object.entries(state.categoriesData).forEach(([slug, cat]) => {
          if (cat.events && cat.events.length > 0) {
            filtered[slug] = cat;
          }
        });
        return filtered;
      },
      getEventCategories(state) {
        if (state.layout && state.layout.someFieldContainingCategories) {
            return state.layout.someFieldContainingCategories.map(cat => ({
                slug: cat.slug,
                name: cat.name
            }));
        }
        return [];
      }
    },
    actions: {
      initCategoriesData() {
        // Инициализация структуры
        this.categoriesToLoad.forEach(cat => {
          this.categoriesData[cat.slug] = { events: [], loading: true, error: false, name: cat.name };
        });
      },
      saveCategoriesToCache() {
        localStorage.setItem('categoriesData', JSON.stringify(this.categoriesData));
        localStorage.setItem('categoriesData_time', Date.now().toString());
        console.log('[categoriesData: SAVED TO CACHE]', JSON.parse(JSON.stringify(this.categoriesData)));
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
        this.categoriesData[category.slug].loading = true;
        this.categoriesData[category.slug].error = false;
        try {
          const params = {
            ...getCommonParams(),
            date: (window.moment ? window.moment() : Date.now()), // Можно заменить на moment().startOf('day').unix()
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
          const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
          this.categoriesData[category.slug].events = uniqueEvents.slice(0, 6);
          console.log('[fetchCategoryEvents] categoriesData:', JSON.parse(JSON.stringify(this.categoriesData)));
        } catch (error) {
          console.error(`Ошибка загрузки категории ${category.slug}:`, error);
          this.categoriesData[category.slug].error = true;
          this.categoriesData[category.slug].events = [];
        } finally {
          this.categoriesData[category.slug].loading = false;
        }
      },
      fetchLayout() {
        if (!this.layoutLoaded) { // Загружаем только один раз
            this.layoutLoaded = new Promise(async (resolve, reject) => {
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
                    resolve(this.layout); // Разрешаем Promise после загрузки
                } catch (error) {
                    console.error("Ошибка загрузки Layout:", error);
                    reject(error); // Отклоняем Promise при ошибке
                }
            });
        }
        return this.layoutLoaded;
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
})
