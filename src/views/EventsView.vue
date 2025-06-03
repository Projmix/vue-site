<script>
import { reactive, ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import ru from 'moment/locale/ru';
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
    const apiService = inject('apiService');

    const loading = ref(true);
    const moreLoading = ref(false);
    const categorySlug = ref(route.params.category || 'theatre');
    const categoryInfo = ref(null);
    const allEvents = ref([]);
    const errorMsg = ref('');
    const displayCount = ref(6);
    const loadStep = ref(6);
    const filterLoading = ref(false); // New ref for filter loading state

    const fetchCategoryEvents = async () => {
      loading.value = true;
      allEvents.value = [];
      categoryInfo.value = null;
      displayCount.value = 6;
      errorMsg.value = '';
      
      try {
        const result = await apiService.getCategoryEvents(categorySlug.value);
        
        categorySlug: categorySlug.value,
        categoryInfo: result.categoryInfo,
        eventsCount: result.events?.length || 0,
      });

        if (!result.events || result.events.length === 0) {
          errorMsg.value = 'В этой категории пока нет доступных событий.';
        } else {
          
          // Преобразуем данные для EventCard
          allEvents.value = result.events.map(eventFromApiService => {
            // eventFromApiService - это уже объект performance, который мы получили от apiService
            // Он был взят из eventsMap, куда мы клали item.performance
            return {
              id: eventFromApiService.id,
              name: eventFromApiService.name,
              image: eventFromApiService.image,
              minPrice: eventFromApiService.minPrice,
              maxPrice: eventFromApiService.maxPrice,
              // Сессии и услуги для EventCard должны браться с того же уровня, 
              // на котором они были в исходном item из sync/data.
              // Однако, apiService.getCategoryEvents сейчас возвращает только отфильтрованные performance объекты.
              // Нам нужно либо модифицировать apiService, чтобы он возвращал весь item, 
              // либо EventCard должен уметь работать только с данными performance.
              // Пока предположим, что EventCard ожидает sessions/services на том же уровне, что и id, name.
              // Это потребует доработки в apiService или EventCard.
              // Для временного исправления ошибки, если sessions/services не являются частью eventFromApiService:
              sessions: eventFromApiService.sessions || [], // Это поле может отсутствовать в eventFromApiService
              services: eventFromApiService.services || [], // Это поле может отсутствовать в eventFromApiService
              types: eventFromApiService.types || [],
            };
          });

          if (allEvents.value[0]) {
            console.log('[EventsView] Пример первого преобразованного события:', allEvents.value[0]);
          }
        }
        
        if (result.categoryInfo) {
          categoryInfo.value = result.categoryInfo;
        } else {
          categoryInfo.value = {
            name: `Категория "${categorySlug.value}"`,
            slug: categorySlug.value
          };
          console.warn('[EventsView] Нет информации о категории, используем значение по умолчанию');
        }

        useHead({
          title: categoryInfo.value.seoTitle || categoryInfo.value.h1 || `${categoryInfo.value.name} - Афиша событий` || 'События',
          meta: [
            {
              name: 'description',
              content: categoryInfo.value.seoDescription || 
                      `Афиша ${categoryInfo.value.name.toLowerCase()}. Расписание мероприятий, цены на билеты.` || 
                      'Список событий'
            }
          ]
        });
      } catch (error) {
        console.error(`[EventsView] Ошибка загрузки категории ${categorySlug.value}:`, error);
        categoryInfo.value = { name: `Категория "${categorySlug.value}"` };
        allEvents.value = [];
        errorMsg.value = 'Не удалось загрузить события. Пожалуйста, попробуйте позже.';
      } finally {
        loading.value = false;
      }
    };

    const loadMoreEvents = () => {
      moreLoading.value = true;
      setTimeout(() => {
        displayCount.value += loadStep.value;
        moreLoading.value = false;
      }, 300); // Небольшая задержка для UX
    };

    const displayedEvents = computed(() => {
      return allEvents.value.slice(0, displayCount.value);
    });

    const hasMoreEvents = computed(() => {
      return displayCount.value < allEvents.value.length;
    });

    // Следим за изменением параметра роута и подстраиваемся под новый формат /afisha/:category
    watch(() => route.params.category, (newSlug) => {
      // Если newSlug пустой (маршрут /afisha без категории), используем theatre по умолчанию
      categorySlug.value = newSlug || 'theatre';
      fetchCategoryEvents();
    });

     onMounted(() => {
        // Убедимся, что layout загружен перед запросом событий
        props.layoutLoaded.then(() => {
            fetchCategoryEvents();
        }).catch(error => {
        console.error("[EventsView] Ошибка ожидания layoutLoaded:", error);
            fetchCategoryEvents(); // Пытаемся загрузить в любом случае
        });
     });

    return {
      background,
      logo,
      logo2,
      loading,
      moreLoading,
      filterLoading,
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

      <!-- Events List -->
      <section class="section-space-default bg-light">
            <div class="container">
                <div v-if="!loading && errorMsg" class="alert alert-danger">
                    {{ errorMsg }}
                </div>

                <div v-if="!loading && !errorMsg">
                    <div class="section-title text-center mb-5">
                        <div v-if="categoryInfo?.description" class="category-description mt-3" v-html="categoryInfo.description"></div>
                    </div>

                    <div v-if="filterLoading" class="text-center py-4">
                        <p>Фильтрация событий...</p>
                    </div>

                    <transition-group name="fade-list" tag="div" class="events-view-grid">
                        <EventCard 
                            v-for="event in displayedEvents" 
                            :key="event.id" 
                            :event="event" 
                            class="fade-list-item" 
                        />
                        <div v-if="displayedEvents.length === 0" class="no-events-message" key="no-events">
                            <p>В этой категории пока нет доступных событий.</p>
                        </div>
                    </transition-group>

                    <div v-if="hasMoreEvents" class="load-more-container">
                        <button 
                            @click="loadMoreEvents" 
                            :disabled="moreLoading" 
                            class="btn-fill size-lg color-yellow border-radius-5"
                        >
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

.section-title {
    margin-bottom: 2rem;
}

.section-title h2 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1rem;
}

.alert {
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
}

.alert-danger {
    background-color: #fff3f3;
    border: 1px solid #ffcdd2;
    color: #d32f2f;
}

.no-events-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 0;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    margin: 1rem 0;
}

.no-events-message p {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
}
</style>