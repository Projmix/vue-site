<script>
import { reactive, ref, computed, onMounted, onBeforeUnmount, inject } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import axios from 'axios';
import '@splidejs/vue-splide/css';
import ru from 'moment/locale/ru'; // Убедитесь, что локаль импортирована
import EventCard from '../components/EventCard.vue'; // Предполагаемый компонент
import NewsCard from '../components/NewsCard.vue'; // Предполагаемый компонент
// import apiService from '@/services/apiService'; // Используйте централизованный сервис, если он есть

export default {
  name: "Home",
  components: {
    headerSection,
    footerSection,
    Splide,
    SplideSlide,
    EventCard,
    NewsCard,
  },
  setup() {
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);

    // // Добавлено: categoriesData из Pinia store
    // const categoriesData = computed(() => layoutStore.getEventCategories || []);

    // Добавлено: categoriesToLoad для избежания ReferenceError
    const categoriesToLoad = ref([
      { slug: 'kino', name: 'Кино' },
       { slug: 'theatre', name: 'Театр' }, // Раскомментируйте нужные
       { slug: 'concert', name: 'Концерты' },
      { slug: 'sport', name: 'Спорт' },
       { slug: 'activ', name: 'Активный отдых' },
       { slug: 'kids', name: 'Детям' },
       { slug: 'vistavki', name: 'Выставки' },
       { slug: 'learn', name: 'Обучение' },
       //{ slug: 'festival', name: 'Фестивали' },
       { slug: 'circus', name: 'Цирк' },
       //{ slug: 'opera', name: 'Опера и балет' },
       { slug: 'kvesty', name: 'Квесты' },
    ]);

    const categoriesData = reactive({}); // { kino: { events: [], loading: true, error: false }, ... }
    const newsItems = ref([]);
    const newsLoading = ref(true);
    const generalLoading = ref(true); // Общий лоадер для страницы

    const selectedCityId = ref(import.meta.env.VITE_API_CITY_ID); // Можно сделать динамическим

    // Инициализация categoriesData
    categoriesToLoad.value.forEach(cat => {
      categoriesData[cat.slug] = { events: [], loading: true, error: false, name: cat.name };
    });

    const getCommonParams = (cityId = null) => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: cityId || selectedCityId.value,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    });

    // Переносим axios из data/methods в setup
    let axiosInstance = inject ? inject('$axios') : undefined;
    if (!axiosInstance) axiosInstance = axios; // fallback на глобальный импорт


    const fetchCategoryEvents = async (category) => {
      categoriesData[category.slug].loading = true;
      categoriesData[category.slug].error = false;
      try {
        const params = {
          ...getCommonParams(),
          date: moment().startOf('day').unix(), // Сегодняшняя дата
          ignoreEndTime: 0,
        };
        console.log(`[fetchCategoryEvents] slug: ${category.slug}, params:`, params);
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/${category.slug}`;
        const response = await axiosInstance.get(apiUrl, { params });
        console.log(`[fetchCategoryEvents] slug: ${category.slug}, response:`, response);
        
        let events = [];
        if (response.data.data?.currentDate?.length) {
          events = events.concat(response.data.data.currentDate);
        }
        // Можно добавить и другие источники событий, если API их возвращает для этой категории
        // if (response.data.data?.month?.[0]?.performances?.length) {
        //   events = events.concat(response.data.data.month[0].performances);
        // }

        const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
        categoriesData[category.slug].events = uniqueEvents.slice(0, 6); // Берем первые 6
        // Можно получить реальное имя категории из ответа, если нужно
        // categoriesData[category.slug].name = response.data.type?.name || category.name;

      } catch (error) {
        console.error(`Ошибка загрузки категории ${category.slug}:`, error);
        categoriesData[category.slug].error = true;
        categoriesData[category.slug].events = [];
      } finally {
        categoriesData[category.slug].loading = false;
      }
    };

    const fetchNews = async () => {
      newsLoading.value = true;
      try {
        const params = {
          ...getCommonParams(),
          page: 1,
          perPage: 6, // Количество новостей на главной
        };
        console.log('[fetchNews] params:', params);
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts`;
        const response = await axiosInstance.get(apiUrl, { params });
        console.log('[fetchNews] response:', response);
        newsItems.value = response.data.posts || [];
      } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        newsItems.value = [];
      } finally {
        newsLoading.value = false;
      }
    };

    const loadAllData = async () => {
      generalLoading.value = true;
      const promises = categoriesToLoad.value.map(fetchCategoryEvents);
      promises.push(fetchNews()); // Добавляем загрузку новостей в общий пул
      await Promise.all(promises);
      generalLoading.value = false;
    };

    onMounted(() => {

      layoutStore.layoutLoaded.then(() => {
        loadAllData();
        // Инициализация jQuery-плагинов
        if (window.$ && typeof window.$.fn.meanmenu === 'function') {
          $('nav#dropdown').meanmenu({
            siteLogo: "<div class='mobile-menu-nav-back'><a href='index.html'><img src='../assets/images/logo.png'/></a></div>"
          });
        }
        if (window.$ && typeof window.$.scrollUp === 'function') {
          $.scrollUp({
            scrollText: '<i class="fa fa-angle-up"></i><p>TOP</p>',
            easingType: 'linear',
            scrollSpeed: 900,
          });
        }
      }).catch(error => {
        console.error("Ошибка загрузки layout:", error);
        // Загружаем данные даже если layout не загрузился, используя дефолтные значения
        loadAllData();
      });
    });

    onBeforeUnmount(() => {
      // destroy
    });

    const formatDate = (date, format = 'DD MMM YYYY') => {
      return moment(date).format(format);
    };



    return {
      layoutStore,
      background,
      logo,
      logo2,
      categoriesData,
      categoriesToLoad,
      newsItems,
      newsLoading,
      generalLoading,
      formatDate,
      //afisha,
      //sportEventsAll,
    };
  },
  props: ['layoutLoaded'],
  // computed: {
  //   soonFilms() {
  //     let result = [];
  //     if (this.afisha.data && this.afisha.data.month && this.afisha.data.month.length) {
  //       this.afisha.data.month.forEach(mon => {
  //         result.push(...mon.performances);
  //       });

  //       result = result.filter(perf => ((moment().startOf('day').unix() + 86400) <= perf.start_timestamp));

  //       if (result.length > 8) {
  //         result = result.slice(0, 8);
  //       }

  //       return result;
  //     }
  //     return result;
  //   }
  // },
  // data() {
  //   return {
  //     afisha: {},
  //     sportEvents: [],
  //     sportEventsAll: [],
  //     loading: true,
  //     splideOptionsEvents: {
  //       type: 'slide',
  //       perPage: 6,
  //       breakpoints: {
  //         600: {
  //           perPage: 2,
  //           gap: '1rem',
  //         },
  //       },
  //       pagination: false,
  //       arrows: false,
  //     },
  //     splideOptionsBanner: {
  //       type: 'slide',
  //       perPage: 1,
  //       pagination: false,
  //       arrows: false,
  //     },
  //     tagColors: [
  //       'blue',
  //       'yell',
  //       'orange',
  //       'green'
  //     ],

  //   };
  // },
  // methods: {
  //   async getAfisha() {
  //     const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/kino`;
  //     const params = {
  //       lang: import.meta.env.VITE_API_LANG,
  //       jsonld: import.meta.env.VITE_API_JSONLD,
  //       ignoreEndTime: 0,
  //       cityId: import.meta.env.VITE_API_CITY_ID,
  //       date: moment().startOf('day').unix(),

  //       onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
  //       domain: import.meta.env.VITE_API_DOMAIN,
  //       distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
  //       // expand: 'sessions'


  //       // ignoreEndTime: 1,
  //       // home_sort: 1,
  //       // limit: 12,
  //       // onlyData:0,
  //     };


  //     await this.$axios.get(apiUrl, { params }).then(response => {
  //       console.log('API AFISHA:', response.data);
  //       this.afisha = response.data;

  //       useHead({
  //         title: 'Киноафиша Бобруйска – Кинотеатры "Товарищ" и "Мир" | Купить билеты онлайн',
  //         meta: [
  //           {
  //             name: 'description',
  //             content: 'Актуальная киноафиша города Бобруйска. Расписание сеансов в кинотеатрах "Товарищ" и "Мир". Покупка билетов онлайн, трейлеры, описания фильмов и удобный выбор мест.'
  //           },
  //           {
  //             name: 'keywords',
  //             content: 'кино Бобруйск, кинотеатр Товарищ, кинотеатр Мир, купить билеты в кино, афиша Бобруйск, фильмы сегодня, расписание кино'
  //           }
  //         ]
  //       });

  //       // --- Новая логика ---
  //       const categoriesToLoad = ref([
  //         { slug: 'kino', name: 'Кино' },
  //         // { slug: 'theatre', name: 'Театр' }, // Раскомментируйте нужные
  //         // { slug: 'concert', name: 'Концерты' },
  //         { slug: 'sport', name: 'Спорт' },
  //         // { slug: 'activ', name: 'Активный отдых' },
  //         // { slug: 'kids', name: 'Детям' },
  //         // { slug: 'vistavki', name: 'Выставки' },
  //         // { slug: 'learn', name: 'Обучение' },
  //         // { slug: 'festival', name: 'Фестивали' },
  //         // { slug: 'circus', name: 'Цирк' },
  //         // { slug: 'opera', name: 'Опера и балет' },
  //         // { slug: 'kvesty', name: 'Квесты' },
  //       ]);
  //       const categoriesData = reactive({}); // { kino: { events: [], loading: true, error: false }, ... }
  //       const newsItems = ref([]);
  //       const newsLoading = ref(true);
  //       const generalLoading = ref(true); // Общий лоадер для страницы

  //       const selectedCityId = ref(import.meta.env.VITE_API_CITY_ID); // Можно сделать динамическим

  //       // Инициализация categoriesData
  //       categoriesToLoad.value.forEach(cat => {
  //         categoriesData[cat.slug] = { events: [], loading: true, error: false, name: cat.name };
  //       });

  //       const getCommonParams = (cityId = null) => ({
  //         lang: import.meta.env.VITE_API_LANG,
  //         jsonld: import.meta.env.VITE_API_JSONLD,
  //         cityId: cityId || selectedCityId.value,
  //         onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
  //         domain: import.meta.env.VITE_API_DOMAIN,
  //         distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
  //       });

  //       // Переносим axios из data/methods в setup
  //       const axiosInstance = inject('$axios'); // Получаем axios, если он зарегистрирован глобально

  //       const fetchCategoryEvents = async (category) => {
  //         categoriesData[category.slug].loading = true;
  //         categoriesData[category.slug].error = false;
  //         try {
  //           const params = {
  //             ...getCommonParams(),
  //             date: moment().startOf('day').unix(), // Сегодняшняя дата
  //             ignoreEndTime: 0,
  //           };
  //           const response = await axiosInstance.get(`/api/v3/mobile/afisha/${category.slug}`, { params });

  //           let events = [];
  //           if (response.data.data?.currentDate?.length) {
  //             events = events.concat(response.data.data.currentDate);
  //           }
  //           // Можно добавить и другие источники событий, если API их возвращает для этой категории
  //           // if (response.data.data?.month?.[0]?.performances?.length) {
  //           //   events = events.concat(response.data.data.month[0].performances);
  //           // }

  //           const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
  //           categoriesData[category.slug].events = uniqueEvents.slice(0, 6); // Берем первые 6
  //           // Можно получить реальное имя категории из ответа, если нужно
  //           // categoriesData[category.slug].name = response.data.type?.name || category.name;

  //         } catch (error) {
  //           console.error(`Ошибка загрузки категории ${category.slug}:`, error);
  //           categoriesData[category.slug].error = true;
  //           categoriesData[category.slug].events = [];
  //         } finally {
  //           categoriesData[category.slug].loading = false;
  //         }
  //       };

  //       const fetchNews = async () => {
  //         newsLoading.value = true;
  //         try {
  //           const params = {
  //             ...getCommonParams(),
  //             page: 1,
  //             perPage: 6, // Количество новостей на главной
  //           };
  //           const response = await axiosInstance.get(`/api/v3/arena/posts`, { params });
  //           newsItems.value = response.data.posts || [];
  //         } catch (error) {
  //           console.error("Ошибка загрузки новостей:", error);
  //           newsItems.value = [];
  //         } finally {
  //           newsLoading.value = false;
  //         }
  //       };

  //       const loadAllData = async () => {
  //         generalLoading.value = true;
  //         const promises = categoriesToLoad.value.map(fetchCategoryEvents);
  //         promises.push(fetchNews()); // Добавляем загрузку новостей в общий пул
  //         await Promise.all(promises);
  //         generalLoading.value = false;
  //       };
  //     });

  //     setTimeout(() => {
  //       this.loading = false;
  //     }, 500);
  //   },

  //   async getSportEvents() {
  //     const apiUrl = `https://webgate2.24guru.by/api/v3/mobile/afisha/sport`;
  //     try {
  //       const response = await axios.get(apiUrl, { params: { lang: 'ru' } });
  //       this.sportEvents = response.data.data?.currentDate || [];
  //       // Собрать все month[].performances в один массив
  //       this.sportEventsAll = [];
  //       if (response.data.data && response.data.data.month && Array.isArray(response.data.data.month)) {
  //         response.data.data.month.forEach(mon => {
  //           if (Array.isArray(mon.performances)) {
  //             this.sportEventsAll.push(...mon.performances);
  //           }
  //         });
  //       }
  //     } catch (e) {
  //       this.sportEvents = [];
  //       this.sportEventsAll = [];
  //     }
  //   },

  //   strTimestampToHumanTime(timestamp) {
  //     return moment(timestamp * 1000).format('DD.MM.YYYY');
  //   },
  //   formatDate(date, format = 'DD MMM') {
  //     return moment(date).format(format);
  //   },
  // },
  // beforeMount() {
  //   this.layoutLoaded
  //     .then(() => this.getAfisha())
  //     .then(() => this.getSportEvents())
  //     .catch(error => console.error("Ошибка выполнения getAfisha/getSportEvents", error));
  // },
};
</script>

<template>
  <main>
    <!--preloading-->
    <div id="preloader" v-if="loading">
      <img class="logo" :src="logo2" alt="" width="119" height="58">
      <div id="status">
        <span></span>
        <span></span>
      </div>
    </div>

    <headerSection />

    <!-- Slider Area Start Here -->
    <div class="slider-area slider-layout4 slider-direction-layout2" id="fixed-type-slider">
      <div class="bend niceties preview-1">
        <div id="ensign-nivoslider-3" class="slides">
          <img src="@/assets/images/slider/slide4-1.jpg" alt="slider" title="#slider-direction-1" style="cursor:pointer"
            @click="$router.push(`/event/1`)" />
          <img src="@/assets/images/slider/slide4-2.jpg" alt="slider" title="#slider-direction-2" style="cursor:pointer"
            @click="$router.push(`/event/2`)" />
          <img src="@/assets/images/slider/slide4-3.jpg" alt="slider" title="#slider-direction-3" style="cursor:pointer"
            @click="$router.push(`/event/3`)" />
        </div>
        <div id="slider-direction-1" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-1">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <h3 class="title title-bold color-light hover-yellow size-xl first-line">
                  <a href="#" @click.prevent="$router.push(`/event/1`)">18 October, 2018 | Minsk</a>
                </h3>
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
              </div>
            </div>
            <div class="slider-btn-area forth-line margin-t-30">
              <a href="#" class="btn-fill color-yellow" @click.prevent="$router.push(`/event/1`)">Buy Tickets Now!</a>
            </div>
          </div>
        </div>
        <div id="slider-direction-2" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-2">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <h3 class="title title-bold color-light hover-yellow size-xl first-line">
                  <a href="#" @click.prevent="$router.push(`/event/1`)">18 October, 2018 | Minsk</a>
                </h3>
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
              </div>
            </div>
            <div class="slider-btn-area forth-line margin-t-30">
              <a href="#" class="btn-fill color-yellow" @click.prevent="$router.push(`/event/1`)">Buy Tickets Now!</a>
            </div>
          </div>
        </div>
        <div id="slider-direction-3" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-3">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <h3 class="title title-bold color-light hover-yellow size-xl first-line">
                  <a href="#" @click.prevent="$router.push(`/event/1`)">18 October, 2018 | Minsk</a>
                </h3>
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
              </div>
            </div>
            <div class="slider-btn-area forth-line margin-t-30">
              <a href="#" class="btn-fill color-yellow" @click.prevent="$router.push(`/event/1`)">Buy Tickets Now!</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Slider Area End Here -->
    <!-- Countdown Area Start Here -->
    <!-- <section>
      <div class="container-fluid">
        <div class="row no-gutters full-width">
          <div class="col-lg-4">
            <div class="height-100 d-flex align-items-center bg-primary">
              <div class="upcoming-event-layout2 zindex-up">
                <h2>East Tobaco</h2>
                <div class="event-location">26 Street, London</div>
                <div class="event-date">17 October - 22 Octber, 2018</div>
              </div>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="countdown-layout1">
              <div id="countdown"></div>
            </div>
          </div>
        </div>
      </div>
    </section> -->
    <!-- Countdown Area End Here -->
    <!-- About Area Start Here -->
    <section class="section-space-custom-less30 bg-common bg-accent"
      style="background-image: url(img/figure/figure3.png);">
      <div class="container-fluid">
        <div class="about-layout3">
          <img src="@/assets/images/about/about-logo.png" alt="logo" class="img-fluid">
          <p>Emply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
            dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
            simply dummy text of the rinting and typesetting industry.standard dummy text ever since.Emply
            dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
            when an unknown printer took.</p>
        </div>
      </div>
    </section>
    <!-- About Page Area End Here -->
    <!-- Schedule Area Start Here -->
    <section class="section-space-top-default bg-light">
      <div class="container-fluid">
        <div class="section-heading title-black color-dark">
          <h2>Event Schedule &amp; Agenda</h2>
          <p>Dorem ipsum dolor sit. Incidunt laborum beatae earum nihil odio consequatur</p>
        </div>
        <div class="row no-gutters full-width">
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back1.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">17 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Linex StartUp</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Steven John</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>CityCafe</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back2.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">18 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Admin Dashboard</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Lara Josef</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>Oporajita</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back3.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">10 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Linex StartUp</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Justin Teak</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>CityCafe</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Schedule Area End Here -->

    <section v-for="(category, slug) in categoriesData" :key="slug"
      class="section-space-default bg-light overlay-icon-layout4">
      <div class="container-fluid zindex-up zoom-gallery menu-list-wrapper">
        <div class="section-heading title-black color-dark all-category">
          <div>
            <h2>{{ category.name }}</h2>
            <p>Описание категории</p>
          </div>
          <div class="col-12 text-center">
            <router-link :to="{ name: 'events-category', params: { category: slug } }"
              class="loadmore-four-item btn-fill border-radius-5 size-lg color-yellow margin-t-30">
              Все события
            </router-link>
          </div>
        </div>

        <div class="row gutters full-width menu-list">
          <template v-if="category.loading">
            <div class="col-12"><p>Загрузка событий...</p></div>
          </template>
          <template v-else-if="category.error">
            <div class="col-12"><p>Не удалось загрузить события.</p></div>
          </template>
          <template v-else-if="category.events.length">
            <div v-for="event in category.events.slice(0, 6)" :key="event.id"
              class="col-lg-4 col-md-4 col-sm-6 col-12 menu-item">
              <div class="speaker-layout3 event-card-fixed">
                <router-link :to="`/event/${event.id}`">
                  <img :src="event.image['300x430'] || event.image['240x340'] || require('@/assets/images/speaker/speaker1.png')" :alt="event.name" class="img-fluid">
                </router-link>
                <div class="item-title">
                  <h3 class="title title-medium color-light hover-yellow size-md">
                    <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
                  </h3>
                  <div class="text-left title-light size-md color-light">{{ event.genre }}</div>
                </div>
                <div class="item-social">
                  <ul>
                    <li>
                      <a href="#" title="twitter"><i class="fa fa-twitter" aria-hidden="true"></i></a>
                    </li>
                    <li>
                      <a href="#" title="linkedin"><i class="fa fa-linkedin" aria-hidden="true"></i></a>
                    </li>
                    <li>
                      <a href="#" title="pinterest"><i class="fa fa-pinterest" aria-hidden="true"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="col-12"><p>В данной категории пока нет событий.</p></div>
          </template>
        </div>

      </div>
    </section>

    <!-- Раздел новостей -->
    <section class="news-section section-space-default-less30 bg-light" v-if="!newsLoading && newsItems.length">
      <div class="container">
        <div class="section-heading-container">
          <div class="section-heading title-black color-dark text-left">
            <h2>Последние новости</h2>
            <p>Новости и обновления киноафиши</p>
          </div>
          <div class="see-all-button">
            <router-link :to="{ name: 'posts' }" class="btn-fill border-radius-5 size-md color-yellow">
              Все новости
            </router-link>
          </div>
        </div>

        <div class="news-grid home-grid">
          <NewsCard v-for="post in newsItems" :key="post.id" :post="post" />
        </div>
      </div>
    </section>
    <!-- Speaker Area Start Here (Сегодня в кино)
    <section class="section-space-default bg-light overlay-icon-layout4">
      <div class="container-fluid zindex-up zoom-gallery menu-list-wrapper">
        <div class="container-name-category">
          <div class="section-heading title-black color-dark text-left">
            <h2>Сегодня в кино</h2>
            <p>Актуальные фильмы на сегодня</p>
          </div>
          <div class="col-12 text-right ">
            <router-link :to="{ name: 'events-category', params: { category: 'kino' } }"
              class="btn-fill border-radius-5 size-lg color-yellow margin-t-30">Все фильмы</router-link>
          </div>
        </div>

        <div v-if="afisha && afisha.data && afisha.data.currentDate" class="row gutters full-width menu-list">
          <div v-for="event in afisha.data.currentDate.slice(0, 6)" :key="event.id"
            class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 menu-item">
            <div class="speaker-layout3 event-card-fixed">
              <img :src="event.image['300x430']" :alt="event.name" class="img-fluid" />
              <div class="item-title">
                <h3 class="title title-medium color-light hover-yellow size-md">
                  <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
                </h3>
                <div class="text-left title-light size-md color-light">{{ event.genre }}</div>
              </div>
              <div class="item-social">
                <ul>
                  <li>
                    <span v-if="event.kinopoisk_rank" class="kp-rating">
                      <span class="kp-star">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="#fad03b"
                          xmlns="http://www.w3.org/2000/svg">
                          <polygon
                            points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,19.02 10,15.6 4.18,19.02 6,12.14 0.49,7.64 7.41,7.36" />
                        </svg>
                      </span>
                      <span class="kp-value">{{ event.kinopoisk_rank.toFixed(1) }}</span>
                      <span class="kp-max">/10</span>
                    </span>
                  </li>
                  <li>
                    <a href="#" title="twitter">
                      <i class="fa fa-twitter" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" title="linkedin">
                      <i class="fa fa-linkedin" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" title="pinterest">
                      <i class="fa fa-pinterest" aria-hidden="true"></i>
                    </a>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section> -->
    <!-- Спорт афиша на главной
    <section class="section-space-default bg-light overlay-icon-layout4">
      <div class="container-fluid zindex-up zoom-gallery menu-list-wrapper">
        <div class="section-heading title-black color-dark text-left">
          <div class="container-name-category">
            <div class="section-heading title-black color-dark text-left">
              <h2>Сегодня в спорте</h2>
              <p>Актуальные спортивные события</p>
            </div>
            <div class="col-12 text-right">
              <router-link :to="{ name: 'events-category', params: { category: 'sport' } }"
                class="btn-fill size-lg color-yellow border-radius-5 margin-t-30">Все спортивные события</router-link>
            </div>
          </div>

        </div>
        <div class="row gutters full-width menu-list">
          <div v-for="event in (categoriesData['sport'] && categoriesData['sport'].events ? categoriesData['sport'].events.slice(0, 6) : [])" :key="event.id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 menu-item">
            <div class="speaker-layout3 event-card-fixed">
              <img :src="event.image['300x430']" :alt="event.name" class="img-fluid">
              <div class="item-title">
                <h3 class="title title-bold color-light hover-yellow">
                  <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
                </h3>
                <div class="title-light size-md text-left color-light">{{ event.genre }}</div>
              </div>
              <div class="item-social">
                <ul>
                  <li v-if="event.socials && event.socials.facebook">
                    <a :href="event.socials.facebook" title="facebook"><i class="fa fa-facebook"
                        aria-hidden="true"></i></a>
                  </li>
                  <li v-if="event.socials && event.socials.twitter">
                    <a :href="event.socials.twitter" title="twitter"><i class="fa fa-twitter"
                        aria-hidden="true"></i></a>
                  </li>
                  <li>
                    <a href="#" title="linkedin">
                      <i class="fa fa-linkedin" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" title="pinterest">
                      <i class="fa fa-pinterest" aria-hidden="true"></i>
                    </a>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- End Speaker Area -->
    <!-- Progress Area Start Here -->
    <section class="section-space-md bg-common progress-bg-color"
      style="background-image: url(@/assets/images/figure/figure6.png);">
      <div class="container-fluid">
        <div class="row no-gutters">
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-map-marker" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>Tobacco, London</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-users" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>30+ Speakers</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-clone" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>15+ Main Sponsor</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Progress Area End Here -->
    <!-- Pricing Plan Area Start Here -->
    <section class="section-space-default-less30 overlay-icon-layout2 bg-common bg-accent"
      style="background-image: url(@/assets/images/figure/figure5.png);">
      <div class="container zindex-up">
        <div class="section-heading title-black color-dark text-center">
          <h2>Ticket Price &amp; Plan</h2>
          <p>Dorem ipsum dolor sit. Incidunt laborum beatae earum nihil odio consequatur officiis tempore</p>
        </div>
        <div class="row">
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Personal Plan</h3>
                </div>
                <div class="item-price">49
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-yellow border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Business Plan</h3>
                </div>
                <div class="item-price">69
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-primary border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Premium Plan</h3>
                </div>
                <div class="item-price">99
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-green border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Pricing Plan Area End Here -->
    <!-- Sponsonrs Area Start Here -->
    <section class="section-space-default bg-light">
      <div class="container">
        <div class="section-heading title-black color-dark text-center">
          <h2>Offcial Sponsonrs &amp; Partner</h2>
          <p>Check Who Makes This Event Possible!</p>
        </div>
        <div class="sponsonrs-layout1">
          <div class="row">
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand1.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand2.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand3.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand4.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand5.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand6.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand7.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand8.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <a href="#" title="Become a Sponsors"
              class="btn-fill size-lg border-radius-5 color-yellow margin-t-30">Become a Sponsors</a>
          </div>
        </div>
      </div>
    </section>
    <!-- Sponsonrs Area End Here -->
    <!-- Call To Action Area Start Here -->
    <section class="overlay-primary90 overlay-icon-layout1 section-space-default"
      style="background-image: url(img/figure/figure1.jpg);">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="call-to-action-layout1 zindex-up">
              <h2>Get Your Ticket Now</h2>
              <p>Adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim
                ad minim veniam, quis nostrud exercitation.</p>
              <a href="#" title="Buy Tickets" class="btn-fill size-lg border-radius-5 color-yellow">Buy Tickets</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Call To Action Area End Here -->

    <!-- Blog Area Start Here -->
    <section class="section-space-default-less30 bg-common bg-accent" v-if="afisha && afisha.postsAll && afisha.postsAll.length">
      <div class="container-fluid">
        <div class="section-heading title-black color-dark text-center">
          <h2>Последние новости</h2>
          <p>Новости и обновления киноафиши</p>
        </div>
        <div class="row gutters-15 full-width">
          <div v-for="post in afisha.postsAll" :key="post.slug" class="col-xl-3 col-lg-6 col-md-6 col-sm-6">
            <div class="blog-layout3 overlay-gradient">
              <div class="item-date-wrap">
                <div class="item-date">
                  {{ $dayjs(post.publishedAt || post.published_at).format('DD') }}
                </div>
              </div>
              <div class="item-content news-title-only">
                <div class="item-title">
                  <h3 class="title-medium color-light hover-yellow">
                    {{ post.title }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- End Blog Area -->
    <!-- Map Area Start Here -->
    <section class="full-width-container">
      <div class="container-fluid">
        <div class="google-map-area">
          <div id="googleMap" style="width:100%; height:496px;"></div>
          <div class="upcoming-event-layout1">
            <h2>Marketing
              <br> Conferance 2018
            </h2>
            <div class="date">17 - 25 Oct, 2018</div>
            <p>Tobacco Dock, London</p>
          </div>
        </div>
      </div>
    </section>
    <!-- Map Area End Here -->


    <footerSection />

  </main>
</template>


<style scoped>
.main-content-area {
  padding-top: 20px;
  /* Отступ сверху */
}

.category-section,
.news-section {
  /* padding: 40px 0; */
  /* Убрано для использования section-space-* */
  /* margin-bottom: 30px; */
  /* Убрано */
}

.section-heading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  /* Отступ под заголовком */
  flex-wrap: wrap;
  /* Перенос на мобильных */
}

.section-heading {
  margin-bottom: 0;
  /* Убираем стандартный отступ */
  flex-grow: 1;
  /* Заголовок занимает доступное пространство */
}

.section-heading h2 {
  margin-bottom: 5px;
  /* Уменьшаем отступ под заголовком */
}


.see-all-button {
  margin-left: 20px;
  /* Отступ слева для кнопки */
  margin-top: 10px;
  /* Отступ сверху на мобильных */
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 3 колонки */
  gap: 20px;
  /* Промежуток между карточками */
}

/* Адаптация для мобильных устройств */
@media (max-width: 991px) {
  .home-grid {
    grid-template-columns: repeat(2, 1fr);
    /* 2 колонки на планшетах */
  }

  .section-heading-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .see-all-button {
    margin-left: 0;
    margin-top: 15px;
  }
}

@media (max-width: 767px) {
  .home-grid {
    grid-template-columns: repeat(1, 1fr);
    /* 1 колонка на мобильных */
  }
}

/* Стили прелоадера (можно вынести в App.vue или глобальные стили) */
#preloader {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: #fff url('../assets/images/ajax-loader.gif') no-repeat center center;
  /* Путь к гифке */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

#preloader .logo {
  margin-bottom: 20px;
}

#status {
  width: 200px;
  height: 200px;
  position: absolute;
  left: 50%;
  top: 50%;
  /* background-image: url(src/assets/images/ajax-loader.gif); */
  /* Можно использовать gif */
  background-repeat: no-repeat;
  background-position: center;
  margin: -100px 0 0 -100px;
  /* Стили для анимации точек (если не используется gif) */
  display: flex;
  justify-content: center;
  align-items: center;
}

#status span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  background: #dd003f;
  /* Цвет точек */
  border-radius: 50%;
  animation: status-load 1s infinite ease-in-out;
}

#status span:nth-child(2) {
  animation-delay: 0.2s;
}

#status span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes status-load {

  0%,
  100% {
    transform: scale(0);
  }

  50% {
    transform: scale(1);
  }
}

/* Стили для .kp-rating можно вынести в EventCard.vue или глобально */
.kp-rating {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  /* Белый полупрозрачный фон */
  color: #222;
  border-radius: 1.2em;
  padding: 0.15em 0.7em 0.15em 0.4em;
  font-weight: 600;
  font-size: 1.04em;
  /* Можно настроить размер */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-right: 0.5em;
}

.kp-rating .kp-star {
  margin-right: 0.35em;
  display: flex;
  align-items: center;
}

.kp-rating .kp-value {
  color: #fad03b;
  /* Цвет значения рейтинга */
  font-weight: 700;
  font-size: 1.08em;
  /* Размер значения */
  margin-right: 0.15em;
  letter-spacing: 0.01em;
}

.kp-rating .kp-max {
  color: #888;
  /* Цвет "/10" */
  font-size: 0.97em;
  margin-left: 0.08em;
}
.section-heading .col-12{
  flex: 0 0 0%;
  width: max-content;
}
.speaker-layout3.event-card-fixed{
width:200px;
}
.menu-item{
  display: flex;
  justify-content: center;
}
.title.title-medium.color-light.hover-yellow.size-md{
  width: 150px;
  font-size: 14px;
}
.section-heading.title-black.color-dark.all-category{
  display: flex;
  justify-content: space-between;
  padding-left: 50px;
  padding-right: 50px;
}

.news-title-only .item-title h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  min-height: 2.8em;
  max-height: 3.2em;
}
</style>