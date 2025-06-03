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
import { useRouter, useRoute } from 'vue-router';

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
    const route = useRoute();
    let nivoInitialized = false;
    const layoutStore = useLayoutStore();
    const router = useRouter();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);
    
    const siteSlider = computed(() => {
        const slides = layoutStore.getSiteSlider;
        return slides;
    });
    
    const hasSliderData = computed(() => layoutStore.getHasSliderData);
    
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

      if (typeof window.$ === 'undefined' || typeof window.$.fn.nivoSlider === 'undefined') {
        console.warn('[HomeView initNivoSlider] jQuery or Nivo Slider not loaded yet. Retrying in 200ms...');
        setTimeout(initNivoSlider, 200);
        return;
      }

      const sliderElement = window.$('#ensign-nivoslider-3');

      if (sliderElement.length === 0) {
        console.warn('[HomeView initNivoSlider] Nivo Slider element #ensign-nivoslider-3 NOT found in DOM by jQuery. Exiting.');
        return;
      }

      // Clean up any existing slider instance and related elements
      if (nivoInitialized && sliderElement.data('nivoslider')) { 
        try {
          sliderElement.data('nivoslider').destroy();
        } catch (e) {
          console.warn('[HomeView initNivoSlider] Error destroying existing Nivo slider instance:', e);
        }
      }
      
      // Important: Clean up ALL Nivo-related elements
      sliderElement.removeClass('nivoSlider').empty();
      window.$('.nivo-controlNav, .nivo-directionNav, .nivo-box, .nivo-slice, .nivo-caption').remove();
      window.$('.slider-direction').hide(); // Hide all direction elements

      // Re-populate images
      siteSlider.value.forEach((slide, index) => {
        if (slide && slide.href) {
          sliderElement.append(
            `<img src="${slide.href}" alt="slider" title="#slider-direction-${index + 1}" style="display:none;" />`
          );
        }
      });

      // Initialize with modified options
      sliderElement.nivoSlider({
        effect: 'fold',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 1000,
        pauseTime: 5000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function(){
          window.$('.slider-direction').hide();
        },
        afterChange: function(){
          // Show current direction element after change
          const currentSlide = window.$('.nivo-main-image').attr('src');
          const currentIndex = sliderElement.find('img').index(sliderElement.find(`img[src="${currentSlide}"]`));
          window.$(`#slider-direction-${currentIndex + 1}`).show();
        },
        afterLoad: function(){
          window.$('.nivo-controlNav a.nivo-control').text('');
          // Show first slide direction element
          window.$('#slider-direction-1').show();
        }
      });
      nivoInitialized = true;
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
      if (typeof window.$ === 'undefined' || typeof window.$.fn.nivoSlider === 'undefined') {
        layoutStore.loadExternalScripts(); 
      }
      await loadAllData(); 
    });

    watch(
      () => siteSlider.value,
      (newSlides) => {
        
        if (newSlides && newSlides.length > 0) {
          nextTick(() => {
            const sliderElementExists = document.getElementById('ensign-nivoslider-3');

            if (sliderElementExists) {
              if (!nivoInitialized) {
                initNivoSlider();
              } else {
                  nivoInitialized = false;
                  initNivoSlider();
              }
            } else {
              console.warn('[HomeView Watcher nextTick] Element #ensign-nivoslider-3 NOT found in DOM even after nextTick. Slider will not initialize.');
            }
          });
        } else {
        }
      },
      { deep: true, immediate: true }
    );

    onBeforeUnmount(() => {
      if (typeof window.$ !== 'undefined' && typeof window.$.fn.nivoSlider !== 'undefined') {
        try {
          const sliderElement = window.$('#ensign-nivoslider-3');
          if (sliderElement.length) {
            sliderElement.nivoSlider('destroy');
          }
        } catch(e) {
          console.warn("[HomeView] Error destroying Nivo Slider:", e);
          const sliderElement = window.$('#ensign-nivoslider-3');
          sliderElement.removeClass('nivoSlider').empty();
          window.$('.nivo-controlNav, .nivo-directionNav, .nivo-caption').remove();
        }
      }
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

    // Add route watcher
    watch(
      () => route.name,
      (newRouteName) => {
        if (newRouteName === 'home') {
          console.log('[HomeView] Route changed to home, reloading data');
          loadAllData();
        }
      }
    );

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
        <div id="ensign-nivoslider-3" class="slides">
          <template v-for="(slide, index) in siteSlider" :key="`slide-img-${index}`">
            <img
              v-if="slide && slide.href"
              :src="slide.href"
              alt="slider"
              :title="`#slider-direction-${index + 1}`" 
              style="display:none;" />
          </template>
        </div>
        
        <template v-for="(slide, index) in siteSlider" :key="`caption-content-${index}`">
          <div
            v-if="slide && slide.href"
            :id="`slider-direction-${index + 1}`"
            :class="['t-cn', 'slider-direction', `slide-${index + 1}`]"
            style="display: none;"
          >
            <div class='slider-content s-tb'>
              <div class='title-container s-tb-c title-light'>
                <div class='container text-left'>
                  <div class='slider-big-text first-line'>
                    <p>{{ cleanText(slide.title) }}</p>
                  </div>
                  
                  <div v-if="slide.buttonText" class='slider-btn-area forth-line margin-t-30'>
                    <a :href="slide.url || '#'" 
                       class='btn-ghost color-yellow' 
                       :target="slide.url && slide.url.startsWith('http') ? '_blank' : '_self'">
                      {{ slide.buttonText }}
                    </a>
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
        <h2>Нет актуального расписания</h2>
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
  color: var(--theme-text-color:);
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

/* Slider Text Styling */
:global(.nivo-caption) {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
  opacity: 1 !important;
  padding: 0 !important;
  display: block !important;
  pointer-events: auto !important;
}

/* Hide duplicate slider content outside of .nivo-caption */
:global(.bend.niceties.preview-1 > .slider-direction) {
  display: none !important;
}

:global(.nivo-caption .slider-direction) {
  height: 100%;
  opacity: 1 !important;
  display: block !important;
}

:global(.slider-content.s-tb) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  min-height: 200px !important;
}

:global(.title-container.s-tb-c) {
  width: 100%;
  height: auto;
  position: relative !important;
  z-index: 10 !important;
}

:global(.slider-content .container.text-left) {
  padding-left: 80px;
  padding-right: 20px;
  max-width: 800px;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  min-height: 200px !important;
}

:global(.slider-big-text.first-line) {
  margin-bottom: 20px !important;
}

:global(.slider-big-text.first-line p) {
  padding: 0;
  line-height: 1.2;
  font-size: 3.5rem;
  text-transform: capitalize;
  margin-bottom: 0;
  font-weight: 900;
  font-family: 'Roboto', sans-serif;
  position: relative;
  display: inline-block;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

:global(.slider-btn-area.forth-line.margin-t-30) {
  margin-top: 20px !important;
  display: block !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 15 !important;
}

:global(.btn-ghost.color-yellow) {
  padding: 12px 30px;
  background-color: transparent;
  border: 2px solid #fad03b;
  color: #fad03b !important;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative !important;
  z-index: 20 !important;
  opacity: 1 !important;
}

:global(.btn-ghost.color-yellow:hover) {
  background-color: var(--theme-button-color);
  color: #111111 !important;
}

/* Responsive styles */
@media (max-width: 991px) {
  :global(.slider-content .container.text-left) {
    padding-left: 60px;
    min-height: 180px !important;
  }
  :global(.slider-big-text.first-line p) {
    font-size: 25px !important;
  }
  :global(.btn-ghost.color-yellow) {
    padding: 10px 25px;
  }
}

@media (max-width: 767px) {
  :global(.slider-content .container.text-left) {
    padding-left: 40px;
    min-height: 150px !important;
  }
  :global(.slider-big-text.first-line p) {
    font-size: 20px !important;
  }
  :global(.btn-ghost.color-yellow) {
    padding: 8px 20px;
    font-size: 1.9rem;
  }
}

@media (max-width: 575px) {
  :global(.slider-content .container.text-left) {
    padding-left: 20px;
    padding-right: 15px;
    min-height: 120px !important;
  }
  :global(.slider-big-text.first-line p) {
    font-size: 15px !important;
  }
  :global(.btn-ghost.color-yellow) {
    padding: 8px 15px;
    font-size: 1.85rem;
  }
  :global(.slider-btn-area.forth-line.margin-t-30) {
    margin-top: 15px !important;
  }
}

/* Fix for Nivo Caption container */
:global(.nivo-caption > .slider-direction) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  opacity: 1 !important;
}

/* Ensure only one instance of slider content is visible */
:global(.nivo-caption .slider-direction:not(:first-child)) {
  display: none !important;
}

</style>