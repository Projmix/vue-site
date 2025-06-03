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
    const logo2 = computed(() => layoutStore.getLogo2);
    return {
      background,
      logo,
      logo2,
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
      <!--preloading-->
      <div id="preloader" v-if="loading">
          <img class="logo" :src="logo2" alt="" width="119" height="58">
          <div id="status">
              <span></span>
              <span></span>
          </div>
      </div>

      <headerSection />

      <!-- Error state shown only when not loading and error is present -->
      <div v-if="!loading && error" class="container error-container">
        <div class="row">
          <div class="col-md-12 text-center">
            <h2>{{ error }}</h2>
            <router-link to="/" class="btn-fill color-yellow">Вернуться на главную</router-link>
          </div>
        </div>
      </div>

      <!-- Wrapper for main content, shown only when not loading and no error -->
      <div v-if="!loading && !error">
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
        <!-- blog detail section-->
        <div class="page-single">
          <div class="container">
            <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="blog-detail-ct" v-html="page.content">
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
          <!-- Show "empty content" message if page data is loaded but content is missing, or page object is empty -->
          <template v-else>
        <div class="container empty-content-container">
          <div class="row">
            <div class="col-md-12 text-center">
                  <h2>{{ (page && page.title) ? page.title : 'Страница' }}</h2>
              <p>Контент отсутствует</p>
            </div>
          </div>
        </div>
      </template>
      </div>

      <!-- Footer is shown when not loading, regardless of error state -->
      <footerSection v-if="!loading" />
      
    </main>
</template>

<style scoped>
.error-container, .empty-content-container {
  padding: 80px 0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}


</style>
