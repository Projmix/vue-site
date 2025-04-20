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
    return {
      background,
      logo,
      logo2
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

      <headerSection />
      
      <div class="hero common-hero" :style="{ 'background': background }">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="hero-ct">
                <h1>Новости</h1>
                <ul class="breadcumb">
                  <li class="active"><router-link to="/">Главная</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span> Новости</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- blog grid section-->
      <div class="page-single">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12 col-xs-12" v-if="posts && posts.length">
              <div class="row row-objects">
                <div class="col-md-4 col-sm-12 col-xs-12" v-for="(post) in posts" :key="post">
                  <div class="blog-item-style-2">
                    <router-link :to="`/post/${post.slug}`"><img :src="post.image['1600x900']" alt=""></router-link>
                    <div class="blog-it-infor">
                      <h3><router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link></h3>
                      <span class="time">{{ post.publishedAt }}</span>
                      <p v-html="post.shortContent"></p>
                    </div>
                  </div>
                </div>
              </div>

              <vue-awesome-paginate style="margin-top: 2rem;"
                :total-items="posts_last_page"
                v-model="currentPage"
                @click="load"
                :items-per-page="5"
                :max-pages-shown="isMobile ? 2 : 7"
                paginate-buttons-class="btn-paginate"
                active-page-class="btn-paginate-active"
                back-button-class="icon-prev"
                next-button-class="icon-next"
              />
              
            </div>
          </div>
        </div>
      </div>
      <!--end of  blog grid section-->
      <footerSection />
      
    </main>
</template>

<style>
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
