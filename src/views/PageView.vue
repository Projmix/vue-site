<script>
import { reactive, toRaw } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useWidgetStore } from "../stores/widget.js";
import { computed } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { useHead } from '@vueuse/head';
import '@splidejs/vue-splide/css';
import moment from 'moment';
import ru from 'moment/locale/ru';
import apiService from '../services/apiService';
import axios from 'axios';

export default {
  name: "Page",
  components: {
    headerSection,
    footerSection,
    Splide,
    SplideSlide,
  },
  setup() {
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const preloaderLogo = computed(() => layoutStore.getSiteHeaderLogo);
    return {
      background,
      logo,
      preloaderLogo,
      layoutStore
    };

  },
  props: ['layoutLoaded'],
  data() {
    return {
      page: {},
      loading: true,
      error: null,
    };
  },
  methods: {
    async getPage() {
      try {
        const response = await apiService.getPageBySlug(this.$route.params.slug);
        
        if (!response || !response.page) {
          this.error = 'Страница не найдена';
          return;
        }

        this.page = response.page;

        // Установка SEO-метатегов
        useHead({
          title: this.page.seoTitle ? this.page.seoTitle : this.page.title,
          meta: [
            {
              name: 'description',
              content: this.page.seoDescription ? this.page.seoDescription.replace(/<[^>]+>/g, '') : ''
            }
          ]
        });
      } catch (error) {
        console.error("Ошибка загрузки страницы:", error);
        this.error = 'Ошибка загрузки страницы';
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    },

    strTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('DD.MM.YYYY');
    },

    sessionTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('HH:mm');
    },
    
  },
  beforeMount() {
    this.layoutLoaded
      .then(() => this.getPage())
      .catch(error => console.error("Ошибка выполнения getPage", error));
  },
};
</script>

<template>
  <main>
    <headerSection />

    <div id="preloader-content-area" v-if="loading" class="page-content-area-placeholder">
      <img class="logo" :src="preloaderLogo" alt="Загрузка..." width="119" height="58" :style="{ objectFit: 'contain' }">
      <div id="status">
        <span></span>
        <span></span>
      </div>
    </div>

    <div v-if="!loading && error" class="container error-container page-content-area">
      <div class="row">
        <div class="col-md-12 text-center">
          <h2>{{ error }}</h2>
          <router-link to="/" class="btn-fill color-yellow">Вернуться на главную</router-link>
        </div>
      </div>
    </div>

    <div class="hero-wrapper page-content-area" v-if="!loading && !error">
      <template v-if="page && page.content && Object.keys(page).length > 0">
        <div class="hero common-hero" :style="{ 'background': background }">
          <div class="container">
            <div class="row">
              <div class="col-md-12">
                <div class="hero-ct">
                  <h1>{{ page.title }}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="page-single">
          <div class="container">
            <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="blog-detail-ct" v-html="page.content"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="container empty-content-container page-content-area-placeholder-message">
          <div class="row">
            <div class="col-md-12 text-center">
              <h2>{{ (page && page.title) ? page.title : 'Страница' }}</h2>
              <p>Контент отсутствует</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <footerSection />
  </main>
</template>

<style scoped>
.page-content-area-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.page-content-area-placeholder .logo {
  margin-bottom: 20px;
}

.page-content-area-placeholder #status {
  width: 200px;
  height: 200px;
  position: relative;
  left: auto;
  top: auto;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-content-area-placeholder #status span {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  background: #dd003f;
  border-radius: 50%;
  animation: status-load 1s infinite ease-in-out;
}

.page-content-area-placeholder #status span:nth-child(2) {
  animation-delay: 0.2s;
}

.page-content-area-placeholder #status span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes status-load {
  0%, 100% { transform: scale(0); }
  50% { transform: scale(1); }
}

.page-content-area {
}

.error-container, .empty-content-container {
  padding: 80px 0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-content-container.page-content-area-placeholder-message {
  min-height: 50vh;
}

.container.error-container {
  min-height: 50vh;
}
.hero-wrapper{
  min-height: 50vh;
}

</style>
