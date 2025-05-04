<script>
import { reactive, toRaw, onMounted } from 'vue';
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
export default {
  name: "Posts",
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

    // Инициализация и загрузка категорий при монтировании
    onMounted(() => {
      if (typeof layoutStore.initCategoriesData === 'function') {
        layoutStore.initCategoriesData();
        const fromCache = layoutStore.loadCategoriesFromCache();
        if (!fromCache) {
          // Используем импортированный axios
          layoutStore.categoriesToLoad.forEach(cat => {
            layoutStore.fetchCategoryEvents(cat, axios, () => ({}));
          });
        }
      }
    });

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
      posts: [],
      loading: true,
      currentPage: 1,
      posts_last_page: 100,
      isMobile: false
    };
  },
  methods: {
    async getPosts() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          cityId: import.meta.env.VITE_API_CITY_ID,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
          expand: 'sessions',

          perPage: 9,
          page: 1
      };

      
      await this.$axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.posts = response.data.posts;
        this.posts_last_page = response.data.posts_last_page;

        useHead({
          title: 'Новости',
          meta: [
            {
              name: 'description',
              content: 'Новости'
            }
          ]
        });
        
      });

      // await this.getSchedule(null);

      setTimeout(() => {
            this.loading = false;
      }, 500);
    },

    

    strTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('DD.MM.YYYY');
    },

    sessionTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('HH:mm');
    },

    async load() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          
          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
          expand: 'sessions',

          
          perPage: 9,
          page: this.currentPage
      };
      
      await this.$axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.posts = response.data.posts;

      });
    },
    
  },
  beforeMount() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    }
    this.layoutLoaded
      .then(() => this.getPosts())
      .catch(error => console.error("Ошибка выполнения getPosts", error));
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

    <headerSection :filteredCategoriesData="layoutStore.filteredCategoriesData" />

    <!-- Banner and Breadcrumbs as in blog-masonry.html -->
    <section class="inner-page-banner" style="background-image: url(/img/figure/inner-page-figure.jpg);">
      <!-- <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="breadcrumbs-area">
              <h1>Новости</h1>
              <ul>
                <li>
                  <router-link to="/">Главная</router-link>
                </li>
                <li>Новости</li>
              </ul>
            </div>
          </div>
        </div>
      </div> -->
    </section>
      <!-- blog grid section-->
    <!-- Blog Masonry Section Start -->
    <section class="section-space-equal">
      <div class="container">
        <div class="row" id="no-equal-gallery">
          <div
            class="col-lg-4 col-md-6 col-sm-6 col-xs-12 no-equal-item"
            v-for="post in posts"
            :key="post.id"
          >
            <div class="blog-layout4">
              <div class="entry-image">
                <div class="item-image">
                  <router-link :to="`/post/${post.slug}`">
                    <img
                      :src="post.image['1300x560'] || post.image['1600x900']"
                      class="img-responsive"
                      :alt="post.title"
                    />
                  </router-link>
                </div>
                <div class="item-content">
                  <h3 class="title title-bold color-dark hover-primary">
                    <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
                  </h3>
                  <ul class="news-meta-info">
                    <li>{{ post.publishedAt }}</li>
                  </ul>
                  <p v-html="post.shortContent"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Blog Masonry Section End -->
      <footerSection />
      
    </main>
</template>

<style>
@import "../assets/css/style.css";
  .btn-paginate {
    height: 40px;

    width: 40px;

    border: none;

    margin-inline: 5px;

    cursor: pointer;
  }

  .btn-paginate-active {
    background-color: #4280bf;

    color: white;
  }
</style>
