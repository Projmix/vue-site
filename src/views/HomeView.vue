<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import axios from 'axios';
import '@splidejs/vue-splide/css';
import EventCard from '../components/EventCard.vue'; // Предполагаемый компонент
import NewsCard from '../components/NewsCard.vue'; // Предполагаемый компонент
import apiService from '../services/apiService';
import { useRouter } from 'vue-router';

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
  setup(props) {
    let nivoInitialized = false;
    const layoutStore = useLayoutStore();
    const router = useRouter();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);
    
    const siteSlider = computed(() => {
        const slides = layoutStore.getSiteSlider;
        console.log('[HomeView] Slides data:', slides);
        return slides;
    });
    
    const hasSliderData = computed(() => {
        const has = layoutStore.getHasSliderData;
        console.log('[HomeView] Has slider data:', has);
        return has;
    });
    
    // События по категориям из layoutStore, фильтруем только непустые
    const eventsByCategory = computed(() => {
      const allCategories = layoutStore.getEventsByCategory;
      // Фильтруем непустые категории
      const nonEmptyCategories = {};
      Object.entries(allCategories).forEach(([slug, category]) => {
        if (category.events && category.events.length > 0) {
          nonEmptyCategories[slug] = category;
        }
      });
      return nonEmptyCategories;
    });
    
    // Проверка наличия событий в любой категории
    const hasAnyEvents = computed(() => layoutStore.getHasAnyEvents);

    const newsItems = ref([]);
    const newsLoading = ref(true);
    const generalLoading = ref(true); // Общий лоадер для страницы
    const loading = generalLoading;

    // Функция для загрузки новостей
    const fetchNews = async () => {
      newsLoading.value = true;
      try {
        const result = await apiService.getPosts({ page: 1, perPage: 6 });
        newsItems.value = result.posts || [];
      } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        newsItems.value = [];
      } finally {
        newsLoading.value = false;
      }
    };

    // Загрузка только новостей, категории и события через layoutStore
    const loadAllData = async () => {
      generalLoading.value = true;
      
      try {
        // Wait for the layout to be loaded from props.layoutLoaded first
        await props.layoutLoaded;
        
        // Проверяем, есть ли события и загружены ли данные
        // Избегаем дублирующих запросов, если события уже загружены в layoutStore
        if (Object.keys(layoutStore.eventsByCategory).length === 0 && !layoutStore.eventsLoading) {
          console.log('[HomeView] События не загружены, загружаем их');
          try {
            const events = await apiService.getEventsWithSessionsByCategory();
            layoutStore.eventsByCategory = events;
          } catch (error) {
            console.error('[HomeView] Ошибка загрузки событий:', error);
          }
        } else {
          console.log('[HomeView] События уже загружены или загружаются через layoutStore');
        }
        
        // Загружаем новости
        await fetchNews();
      } catch (error) {
        console.error('[HomeView] Error loading data:', error);
      } finally {
        generalLoading.value = false;
      }
    };

    const initNivoSlider = () => {
      const sliderElement = $('#ensign-nivoslider-3');
      sliderElement.removeClass('nivoSlider');
      sliderElement.removeData('nivoslider');
      sliderElement.removeData('nivo:vars');
      sliderElement.find('.nivo-main-image, .nivo-caption').remove();
      $('.nivo-controlNav, .nivo-directionNav, .nivo-slice').remove();
      sliderElement.children('img').show().css('visibility', '');

      sliderElement.nivoSlider({
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
        manualAdvance: false
        // Не нужно afterLoad/afterChange для caption!
      });
      nivoInitialized = true;
      // Очищаем цифры в точках
      $('.nivo-controlNav a.nivo-control').text('');
    };

    const navigateToSlideUrl = (url) => {
      if (!url) return;
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        router.push(url);
      }
    };

    onMounted(async () => {
      console.log('[HomeView] Component mounted');
      await loadAllData();
    });

    // Следим за появлением валидных слайдов и инициализируем слайдер только один раз
    watch(
      () => siteSlider.value && siteSlider.value.filter(s => s && s.href).length,
      (count) => {
        if (!nivoInitialized && count >= 2) {
          nextTick(() => {
            setTimeout(() => {
              if (!nivoInitialized) {
                console.log('[HomeView] Initializing slider after data ready');
                initNivoSlider();
              }
            }, 300);
          });
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      const sliderElement = $('#ensign-nivoslider-3');
      sliderElement.removeClass('nivoSlider');
      sliderElement.removeData('nivoslider');
      sliderElement.removeData('nivo:vars');
      sliderElement.find('.nivo-main-image, .nivo-caption').remove();
      $('.nivo-controlNav, .nivo-directionNav, .nivo-slice').remove();
      nivoInitialized = false;
    });

    const formatDate = (date, format = 'DD MMM YYYY') => {
      return moment(date).format(format);
    };

    // Функция для очистки текста от HTML-сущностей
    const cleanText = (text) => {
        if (!text) return '';
        return text
            .replace(/&nbsp;/g, ' ')  // Заменяем &nbsp; на обычный пробел
            .replace(/&amp;/g, '&')   // Заменяем &amp; на &
            .replace(/&lt;/g, '<')    // Заменяем &lt; на <
            .replace(/&gt;/g, '>')    // Заменяем &gt; на >
            .replace(/&quot;/g, '"')  // Заменяем &quot; на "
            .replace(/&#39;/g, "'")   // Заменяем &#39; на '
            .replace(/\s+/g, ' ')     // Убираем множественные пробелы
            .trim();                  // Убираем пробелы в начале и конце
    };

    return {
      layoutStore,
      background,
      logo,
      logo2,
      hasSliderData,
      siteSlider,
      eventsByCategory,
      hasAnyEvents,
      newsItems,
      newsLoading,
      generalLoading,
      loading,
      formatDate,
      moment,
      navigateToSlideUrl,
      cleanText,
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
    <div v-if="hasSliderData" class="slider-area slider-layout4 slider-direction-layout2" id="fixed-type-slider">
      <div class="bend niceties preview-1">
        <div id="ensign-nivoslider-3" class="slides nivoSlider">
          <template v-for="(slide, index) in siteSlider" :key="index">
            <img
              v-if="slide && slide.href"
              :src="slide.href"
              alt="slider"
              :title="`#slider-direction-${index + 1}`"
              style="width: 100%;"
            />
          </template>
        </div>
        <!-- Captions for each slide (вне .nivoSlider!) -->
        <template v-for="(slide, index) in siteSlider" :key="'caption-' + index">
          <div
            v-if="slide && slide.href"
            :id="`slider-direction-${index + 1}`"
            class="nivo-html-caption"
            style="display: none;"
          >
            <div class='slider-content s-tb'>
              <div class='title-container s-tb-c title-light'>
                <div class='container text-left'>
                  <div class='slider-big-text first-line'><p>{{ cleanText(slide.title) }}</p></div>
                  <div v-if="slide.buttonText" class='slider-btn-area forth-line margin-t-30'>
                    <a :href="slide.url || '#'" class='btn-ghost color-yellow' target='_blank'>{{ slide.buttonText }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- Slider Area End Here -->

    <!-- Блок с событиями по категориям -->
    <div v-if="!hasAnyEvents && !loading" class="section-space-default bg-light no-events-container">
      <div class="container text-center">
        <h2>Данных о мероприятиях нет</h2>
      </div>
    </div>
    
    <section v-for="(category, slug) in eventsByCategory" :key="slug"
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
          <template v-else-if="category.events && category.events.length">
            <div v-for="event in category.events" :key="event.id"
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
    <section class="news-section section-space-default-less30 bg-light">
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

        <div v-if="newsLoading" class="text-center p-5">
          <p>Загрузка новостей...</p>
        </div>
        
        <div v-else-if="newsItems.length" class="news-grid home-grid">
          <NewsCard v-for="post in newsItems" :key="post.id" :post="post" />
        </div>
        
        <div v-else class="text-center p-5">
          <p>Нет новостей</p>
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

.no-events-container {
  padding: 80px 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Inner page banner for when there's no slider */
.inner-page-banner {
  height: 90px;
  background-size: cover;
  background-position: center center;
  position: relative;
  margin-bottom: 20px;
}

.inner-page-banner .banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
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

/* Nivo Control Nav Styling */
/*
:global(.slider-direction-layout2 .nivo-controlNav) {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 10;
  padding: 0;
  text-align: right;
}

:global(.slider-direction-layout2 .nivo-controlNav a.nivo-control) {
  text-indent: -9999px;
  width: 0.6rem;
  height: 3rem;
  background-color: #8cc63e;
  margin-bottom: 1rem;
  display: block;
  cursor: pointer;
  border: none;
  box-shadow: none;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

:global(.slider-direction-layout2 .nivo-controlNav a.nivo-control:hover) {
  opacity: 1;
}

:global(.slider-direction-layout2 .nivo-controlNav a.nivo-control.active) {
  background-color: #fad03b;
  opacity: 1;
}
*/
/* Slider Text Styling */
:global(.slider-layout4 .slider-content .slider-big-text p) {
  padding: 0;
  line-height: 1.2;
  font-size: 3rem;
  text-transform: capitalize;
  margin-bottom: 0;
  font-weight: 900;
  font-family: 'Roboto', sans-serif;
  position: relative;
  display: inline-block;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

:global(.slider-layout4 .slider-content .slider-big-text p::before) {
  position: absolute;
  height: 3px;
  background-color: #ffffff;
  width: 100%;
  content: "";
  left: 0;
  bottom: 2px;
}

/* Button styling */
/* :global(.slider-btn-area a.btn-ghost.color-yellow) {
  border: 2px solid #fad03b;
  color: #fad03b;
  background-color: transparent;
  padding: 10px 25px;
  text-decoration: none;
  font-weight: bold;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

:global(.slider-btn-area a.btn-ghost.color-yellow:hover) {
  background-color: #fad03b;
  color: #111111;
} */

/* Responsive styles */
/* @media (max-width: 991px) {
  :global(.slider-layout4 .slider-content .slider-big-text p) {
    font-size: 4rem;
  }
}

@media (max-width: 767px) {
  :global(.slider-layout4 .slider-content .slider-big-text p) {
    font-size: 3rem;
  }
}

@media (max-width: 575px) {
  :global(.slider-layout4 .slider-content .slider-big-text p) {
    font-size: 2.2rem;
  }
  :global(.slider-direction-layout2 .nivo-controlNav) {
    right: 10px;
  }
  :global(.slider-direction-layout2 .nivo-controlNav a.nivo-control) {
    height: 2rem;
    width: 0.5rem;
    margin-bottom: 0.5rem;
  }
} */
/* .nivo-controlNav a.nivo-control {
  width: 18px;
  height: 18px;
  display: inline-block;
  border-radius: 50%;
  background: #fff;
  opacity: 0.5;
  margin: 0 5px;
  font-size: 0 !important; 
  border: 2px solid #fad03b;
  transition: background 0.3s, opacity 0.3s;
}
.nivo-controlNav a.nivo-control.active {
  background: #fad03b;
  opacity: 1;
  border-color: #fad03b;
  font-size: 0 !important;
}

.nivo-controlNav {
  text-align: center;
  margin-top: 30px;
} */

</style>