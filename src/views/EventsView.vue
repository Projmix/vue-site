<script>
import { reactive, ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import ru from 'moment/locale/ru';
import axios from 'axios';
import EventCard from '../components/EventCard.vue';

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

    const route = useRoute(); 

    const loading = ref(true);
    const moreLoading = ref(false);
    const categorySlug = ref(route.params.category);
    const categoryInfo = ref(null);
    const allEvents = ref([]);
    const errorMsg = ref('');
    const displayCount = ref(12); // Начальное количество
    const loadStep = 12; // Сколько подгружать за раз

    // Получение общих параметров запросов API
    const getCommonParams = () => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: import.meta.env.VITE_API_CITY_ID,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    });

    const fetchCategoryEvents = async () => {
      console.log('[fetchCategoryEvents] categorySlug:', categorySlug.value);
      loading.value = true;
      allEvents.value = [];
      categoryInfo.value = null;
      displayCount.value = 12; // Сброс при загрузке новой категории
      errorMsg.value = '';
      
      try {
        // Используем параметры API в соответствии с документацией
        const params = {
          ...getCommonParams(),
          date: Math.floor(Date.now() / 1000), // текущий timestamp
          ignoreEndTime: 1, // по документации
          objectsIds: 0, // по документации
        };
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/${categorySlug.value}`;
        const response = await axios.get(apiUrl, { params });
        console.log('[fetchCategoryEvents] API response:', response.data);

        categoryInfo.value = response.data.type || {
          name: `Категория "${categorySlug.value}"`,
          slug: categorySlug.value
        };

        // Собираем события из всех секций, согласно API
        let events = [];
        
        // Приоритетно берем данные из month.performances как указано в API
        if (response.data.data?.month?.length) {
          response.data.data.month.forEach(monthData => {
            if (monthData.performances?.length) {
              events = events.concat(monthData.performances);
            }
          });
        }
        
        // Также добавляем события из currentDate, если они есть
        if (response.data.data?.currentDate?.length) {
          events = events.concat(response.data.data.currentDate);
        }
        
        // Также добавляем события из weekend и soon, если они есть
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
        
        // Удаляем дубликаты по ID
        const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());
        
        // Сортируем события по дате начала
        const sortedEvents = uniqueEvents.sort((a, b) => {
          // Если нет timestamp, размещаем в конце
          if (!a.start_timestamp && !b.start_timestamp) return 0;
          if (!a.start_timestamp) return 1;
          if (!b.start_timestamp) return -1;
          return a.start_timestamp - b.start_timestamp;
        });
        
        allEvents.value = sortedEvents;
        console.log('[fetchCategoryEvents] allEvents.value:', allEvents.value);

        // Устанавливаем SEO заголовок и описание
        useHead({
          title: categoryInfo.value.seoTitle || categoryInfo.value.h1 || `События: ${categoryInfo.value.name}` || 'События',
          meta: [
            {
              name: 'description',
              content: categoryInfo.value.seoDescription || `Афиша событий категории ${categoryInfo.value.name}` || 'Список событий'
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
      moreLoading.value = true;
      setTimeout(() => {
        displayCount.value += loadStep;
        moreLoading.value = false;
      }, 300); // Небольшая задержка для UX
    };

    const displayedEvents = computed(() => {
      return allEvents.value.slice(0, displayCount.value);
    });

    const hasMoreEvents = computed(() => {
      return displayCount.value < allEvents.value.length;
    });

    // Следим за изменением параметра роута
    watch(() => route.params.category, (newSlug) => {
      if (newSlug && newSlug !== categorySlug.value) {
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
      layoutStore,
      errorMsg,
    };
  },
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
                <div v-if="!loading && errorMsg" class="alert alert-danger">
                    {{ errorMsg }}
                </div>
                
                <div v-if="!loading && !errorMsg">
                    <div v-if="categoryInfo?.description" class="category-description mb-4">
                        <p v-html="categoryInfo.description"></p>
                    </div>

                    <transition-group name="fade-list" tag="div" class="events-view-grid">
                      <EventCard v-for="event in displayedEvents" :key="event.id" :event="event" class="fade-list-item" />
                      <p v-if="displayedEvents.length === 0" class="no-events-message">В этой категории пока нет событий.</p>
                    </transition-group>

                    <div v-if="hasMoreEvents" class="load-more-container">
                        <button @click="loadMoreEvents" :disabled="moreLoading" class="btn-fill size-lg color-yellow border-radius-5">
                            {{ moreLoading ? 'Загрузка...' : 'Показать ещё' }}
                        </button>
                    </div>
                </div>
                
                <div v-else-if="loading" class="text-center py-5">
                    <p>Загрузка событий...</p>
                </div>
            </div>
      </section>

      <footerSection />

    </main>
</template>

<style scoped>
.category-description {
    margin-bottom: 30px;
    text-align: center;
    font-size: 1.1rem;
    color: #555;
}

.events-view-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 колонки */
  gap: 25px;
  margin-bottom: 30px;
}

.load-more-container {
    text-align: center;
    margin-top: 40px;
}

.no-events-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 0;
    font-size: 1.2rem;
    color: #666;
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
    margin-left: 15%;
    margin-right: 15%;
  }
}
@media (max-width: 500px) {
  .events-view-grid {
    margin-left: 10%;
    margin-right: 10%;
  }
}

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
.container .events-view-grid .speaker-layout3{
  padding-bottom: 0px;
}
.fade-list-item {
  transition: opacity 0.6s, transform 0.6s;
}
.fade-list-enter-from, .fade-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.fade-list-enter-active, .fade-list-leave-active {
  transition: opacity 0.6s, transform 0.6s;
}
.fade-list-enter-to, .fade-list-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>