<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
    // Флаг для отслеживания инициализации Nivo Slider
    let nivoInitialized = false;
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);

    // // Добавлено: categoriesData из Pinia store
    // const categoriesData = computed(() => layoutStore.getEventCategories || []);


    const newsItems = ref([]);
    const newsLoading = ref(true);
    const generalLoading = ref(true); // Общий лоадер для страницы
    const loading = generalLoading;

    const selectedCityId = ref(import.meta.env.VITE_API_CITY_ID); // Можно сделать динамическим

    const getCommonParams = (cityId = null) => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: cityId || selectedCityId.value,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    });

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
        const response = await axios.get(apiUrl, { params });
        console.log('[fetchNews] response:', response);
        let posts = response.data.posts || [];
        console.log(params);
        posts = posts.slice().sort((a, b) => {
          const dateA = moment(a.published_at || a.publishedAt, ["DD.MM.YYYY", moment.ISO_8601], true);
          const dateB = moment(b.published_at || b.publishedAt, ["DD.MM.YYYY", moment.ISO_8601], true);
          if (!dateA.isValid() && !dateB.isValid()) return 0;
          if (!dateA.isValid()) return 1;
          if (!dateB.isValid()) return -1;
          return dateB.valueOf() - dateA.valueOf();
        });
        newsItems.value = posts.slice(0, 6);
        newsItems.value = response.data.posts || [];
      } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        newsItems.value = [];
      } finally {
        newsLoading.value = false;
      }
    };

    // Загрузка только новостей, категории — через layoutStore
    const loadAllData = async () => {
      generalLoading.value = true;
      await fetchNews();
      generalLoading.value = false;
    };


    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          if (window.$ && typeof window.$.fn.nivoSlider === 'function') {
            // Очищаем предыдущую инициализацию
            $('#ensign-nivoslider-3').data('nivo:vars', null).removeClass('nivoSlider');
            $('#ensign-nivoslider-3').nivoSlider({
              effect: 'fade',
              slices: 15,
              boxCols: 8,
              boxRows: 4,
              animSpeed: 500,
              pauseTime: 5000,
              startSlide: 0,
              directionNav: true,
              controlNav: true,
              pauseOnHover: true,
              manualAdvance: false,
            });
            nivoInitialized = true;
          }
        }, 200); // задержка чтобы DOM точно был готов
      });
      // --- Инициализация и загрузка категорий через Pinia store ---
      layoutStore.initCategoriesData();
      const fromCache = layoutStore.loadCategoriesFromCache();
      if (!fromCache) {
        layoutStore.categoriesToLoad.forEach(cat => {
          layoutStore.fetchCategoryEvents(cat, axios, () => ({}));
        });
      }
      // ---
      // Загрузка новостей
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
    });

    onBeforeUnmount(() => {
      if (nivoInitialized) {
        $('#ensign-nivoslider-3').data('nivo:vars', null).removeClass('nivoSlider');
        nivoInitialized = false;
      }
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
      // Категории теперь только через layoutStore

      newsItems,
      newsLoading,
      generalLoading,
      loading,
      formatDate,
      moment,
      //afisha,
      //sportEventsAll,
    };
  },
  props: ['layoutLoaded'],
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
          <img src="@/assets/images/slider/slide4-1.jpg" alt="slider" title="#slider-direction-2" style="cursor:pointer"
            @click="$router.push(`/event/1`)" />
          <img src="@/assets/images/slider/slide4-2.jpg" alt="slider" title="#slider-direction-2" style="cursor:pointer"
            @click="$router.push(`/event/2`)" />
          <img src="@/assets/images/slider/slide4-3.jpg" alt="slider" title="#slider-direction-2" style="cursor:pointer"
            @click="$router.push(`/event/3`)" />
        </div>
        <div id="slider-direction-1" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-1">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <h3 class="title title-bold color-light hover-yellow size-xl first-line">
                  <a href="#" @click.prevent="$router.push(`/event/1`)">18 October, 2025 | Minsk</a>
                </h3>
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2025</p>
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
                  <a href="#" @click.prevent="$router.push(`/event/1`)">20 October, 2025 | Minsk</a>
                </h3>
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2025</p>
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
                  <a href="#" @click.prevent="$router.push(`/event/1`)">22 October, 2025 | Minsk</a>
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
    <section v-for="(category, slug) in layoutStore.filteredCategoriesData" :key="slug"
      class="section-space-default bg-light overlay-icon-layout4">
      <div class="container-fluid zindex-up zoom-gallery menu-list-wrapper">
        <div class="section-heading title-black color-dark all-category text-left">
            <h2>{{ category.name }}</h2>
            <router-link :to="`/afisha/${slug}`"
              class="loadmore-four-item btn-fill border-radius-5 size-lg color-yellow">
              Все события
            </router-link>
        </div>

        <div class="row menu-list">
          <template v-if="category.loading">
            <div class="col-12">
              <p>Загрузка событий...</p>
            </div>
          </template>
          <template v-else-if="category.error">
            <div class="col-12">
              <p>Не удалось загрузить события.</p>
            </div>
          </template>
          <template v-else-if="category.events.length">
            <div v-for="event in category.events.slice(0, 8)" :key="event.id"
              class="col-lg-3 col-md-4 col-sm-6 col-12 menu-item">
              <EventCard :event="event" />
            </div>
          </template>
          <template v-else>
            <div class="col-12">
              <p>В данной категории пока нет событий.</p>
            </div>
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
    <footerSection />

  </main>
</template>


<style scoped>
body main {
  padding-left: 40px;
  padding-right: 40px;

  @media only screen and (max-width: 575px) {
    padding-left: 0;
    padding-right: 0;
  }
}

.main-content-area {
  padding-top: 20px;
}


.section-heading-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  margin-left: 50px;
  margin-right: 50px;
  flex-wrap: wrap;
}

.section-heading {
  margin-bottom: 0;
  flex-grow: 1;
}

.section-heading h2 {
  margin-bottom: 5px;
}


.see-all-button {
  margin-left: 20px;
  margin-top: 10px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Адаптация для мобильных устройств */
@media (max-width: 991px) {
  .home-grid {
    grid-template-columns: repeat(2, 1fr);
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
  }
}

/* Стили прелоадера */
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
  width: 200px;
  height: 200px;
  position: absolute;
  left: 50%;
  top: 50%;
  background-repeat: no-repeat;
  background-position: center;
  margin: -100px 0 0 -100px;
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

.kp-rating {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  color: #222;
  border-radius: 1.2em;
  padding: 0.15em 0.7em 0.15em 0.4em;
  font-weight: 600;
  font-size: 1.04em;
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
  font-weight: 700;
  font-size: 1.08em;
  margin-right: 0.15em;
  letter-spacing: 0.01em;
}

.kp-rating .kp-max {
  color: #888;
  font-size: 0.97em;
  margin-left: 0.08em;
}

.section-heading .col-12 {
  flex: 0 0 0%;
  width: max-content;
}


.row.menu-list {
  margin-right: auto;
  margin-left: auto;
}

@media (max-width: 1200px) {
    .row.menu-list {
        max-width: 1140px;
  }
}
  @media (max-width: 992px) {
    .row.menu-list {
        max-width: 960px;
    }
}
@media (max-width: 768px) {
  .row.menu-list {
        max-width: 720px;
    }
}
@media (max-width: 576px) {
  .row.menu-list {
        max-width: 350px;
    }
  .section-heading.title-black.color-dark.all-category.text-left{
    padding-right: 0px;
    padding-left: 0px;
  }
  .loadmore-four-item.btn-fill{
    padding-right: 2px;
    padding-left: 2px;
    border-radius: 2px;
  }
}

.title.title-medium.color-light.hover-yellow.size-md {
  /*width: 85%;
  font-size: 2rem;*/
}

.section-heading.title-black.color-dark.all-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 50px;
  padding-right: 50px;
  margin-bottom: 30px;
}

.section-heading.title-black.color-dark.all-category h2{
  margin-bottom: 0;
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

.news-section .container {
  max-width: none;

}
.news-section .container .see-all-button{
  margin-top: 0px;
}
</style>