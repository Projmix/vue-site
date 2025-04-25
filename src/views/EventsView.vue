<script>
import { reactive, ref, computed, watch, onMounted, inject, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import ru from 'moment/locale/ru';
import EventCard from '../components/EventCard.vue'; // Предполагаемый компонент
// import apiService from '@/services/apiService'; // Используйте централизованный сервис

export default {
  name: "Events",
  components: {
    headerSection,
    footerSection,
    EventCard,
  },
  props: {
      layoutLoaded: Promise // Пропс из App.vue
  },
  setup(props) {
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);

    const route = useRoute(); // Composition API способ

    const loading = ref(true);
    const moreLoading = ref(false);
    const categorySlug = ref(route.params.category);
    const categoryInfo = ref(null);
    const allEvents = ref([]);
    const errorMsg = ref(''); // Новое: для текста ошибки
    const displayCount = ref(6); // Начальное количество
    const loadStep = 6; // Сколько подгружать за раз

    const selectedCityId = ref(import.meta.env.VITE_API_CITY_ID); // Или динамический

    // Получаем axios через getCurrentInstance().appContext.config.globalProperties
    const { appContext } = getCurrentInstance();
    const axiosInstance = appContext.config.globalProperties.$axios;


    const getCommonParams = (cityId = null) => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: cityId || selectedCityId.value,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    });

    const fetchCategoryEvents = async () => {
  console.log('[fetchCategoryEvents] categorySlug:', categorySlug.value);
      loading.value = true;
      allEvents.value = [];
      categoryInfo.value = null;
      displayCount.value = 6; // Сброс при загрузке новой категории

      errorMsg.value = '';
      try {
        const params = {
          ...getCommonParams(),
          date: moment().startOf('day').unix(), // как на главной!
          ignoreEndTime: 0,
        };
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/${categorySlug.value}`;
        const response = await axiosInstance.get(apiUrl, { params });
        console.log('[fetchCategoryEvents] API response:', response.data);

        categoryInfo.value = response.data.type;

        let events = [];
        // Собираем события из всех источников, как на главной
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
        if (response.data.data?.weekend?.length) {
          response.data.data.weekend.forEach(dayData => {
            if (dayData.performances?.length) {
              events = events.concat(dayData.performances);
            }
          });
        }
        if (response.data.data?.soon?.length) {
          response.data.data.soon.forEach(monthData => {
            if (monthData.performances?.length) {
              events = events.concat(monthData.performances);
            }
          });
        }
        // Убираем дубликаты и сортируем
        const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
        allEvents.value = uniqueEvents.slice(0, 100); // Можно увеличить лимит, если нужно больше
        allEvents.value.sort((a, b) => (a.start_timestamp || 0) - (b.start_timestamp || 0));
        console.log('[fetchCategoryEvents] allEvents.value:', allEvents.value);

        // SEO
        useHead({
          title: categoryInfo.value?.seoTitle || categoryInfo.value?.h1 || `События: ${categoryInfo.value?.name}` || 'События',
          meta: [
            {
              name: 'description',
              content: categoryInfo.value?.seoDescription || `Афиша событий категории ${categoryInfo.value?.name}` || 'Список событий'
            }
          ]
        });
      } catch (error) {
        console.error(`Ошибка загрузки категории ${categorySlug.value}:`, error);
        categoryInfo.value = { name: `Категория "${categorySlug.value}" не найдена` };
        allEvents.value = [];
        errorMsg.value = `Ошибка загрузки: ${error.response?.status || ''} ${error.response?.statusText || ''} ${error.message}`;
      } finally {
        loading.value = false;
      }
    };

    const loadMoreEvents = () => {
      displayCount.value += loadStep;
    };

    const displayedEvents = computed(() => {
      return allEvents.value.slice(0, displayCount.value);
    });

    const hasMoreEvents = computed(() => {
      return displayCount.value < allEvents.value.length;
    });

    // Следим за изменением параметра роута
    watch(() => route.params.category, (newSlug) => {
        if (newSlug) {
            categorySlug.value = newSlug;
            fetchCategoryEvents();
        }
    });

     onMounted(() => {
        // Убедимся, что layout загружен перед запросом событий
        props.layoutLoaded.then(() => {
            fetchCategoryEvents();
        }).catch(error => {
            console.error("Ошибка ожидания layoutLoaded:", error);
            fetchCategoryEvents(); // Пытаемся загрузить в любом случае
        });
     });

    return {
      background,
      logo,
      logo2,
      loading,
      moreLoading,
      categoryInfo,
      displayedEvents,
      hasMoreEvents,
      loadMoreEvents,
    };
  },
  // Старые data, computed, watch, methods не нужны
  // data() { ... }
  // computed: { ... }
  // watch: { ... } // Перенесен в setup
  // methods: { ... } // Перенесены в setup
  // beforeMount() { ... } // Перенесен в setup -> onMounted
};
</script>

<template>
  <main>
      <!--preloading-->
      <div id="preloader" v-if="loading">
          <img class="logo" :src="logo2" alt="Загрузка..." width="119" height="58">
          <div id="status">
              <span></span>
              <span></span>
          </div>
      </div>

      <headerSection />

      <!-- Banner -->
       <section class="inner-page-banner" :style="{ backgroundImage: 'url(' + background + ')' }">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="breadcrumbs-area">
                                <h1 v-if="categoryInfo">{{ categoryInfo.name || categoryInfo.itemsName || 'Категория' }}</h1>
                                <h1 v-else-if="loading">Загрузка...</h1>
                                <h1 v-else>Категория</h1>
                                <ul>
                                    <li>
                                        <router-link to="/">Главная</router-link>
                                    </li>
                                    <li>{{ categoryInfo?.name || 'События' }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
      </section>

      <!-- Events List -->
      <section class="section-space-default bg-light">
            <div class="container">
                 <div v-if="!loading">


                    <div v-if="displayedEvents.length" class="events-view-grid">
                        <EventCard v-for="event in displayedEvents" :key="event.id" :event="event" />
                    </div>
                    <p v-else>В этой категории пока нет событий.</p>

                    <div v-if="hasMoreEvents" class="load-more-container">
                        <button @click="loadMoreEvents" :disabled="moreLoading" class="btn-fill size-lg color-yellow border-radius-5">
                            {{ moreLoading ? 'Загрузка...' : 'Показать ещё' }}
                        </button>
                    </div>
                 </div>
                 <div v-else>
                      <p>Загрузка событий...</p>
                 </div>
            </div>
      </section>

      <footerSection />

    </main>
</template>

<style scoped>
/* Стили для EventsView */
.category-description {
    margin-bottom: 30px;
    text-align: center;
    font-size: 1.1rem;
    color: #555;
}

.events-view-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 колонки */
  gap: 25px; /* Промежуток */
  margin-bottom: 30px;
}

.load-more-container {
    text-align: center;
    margin-top: 40px;
}

/* Адаптация */
@media (max-width: 991px) {
  .events-view-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 колонки */
  }
}

@media (max-width: 767px) {
  .events-view-grid {
    grid-template-columns: 1fr; /* 1 колонка */
    gap: 20px;
  }
}

/* Стили прелоадера скопированы из HomeView, можно вынести */
#preloader {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: #fff url('../assets/images/ajax-loader.gif') no-repeat center center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
#preloader .logo {
    margin-bottom: 20px;
}
#status {
  /* ... стили status ... */
}
#status span {
  /* ... стили span ... */
}
@keyframes status-load {
  /* ... анимация ... */
}
</style>