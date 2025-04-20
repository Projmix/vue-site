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
      logo2
    };
  },
  props: ['layoutLoaded'],
  data() {
    return {
      page: {},
      loading: true,
    };
  },
  methods: {
    async getPage() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/page/${this.$route.params.slug}`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          cityId: import.meta.env.VITE_API_CITY_ID,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
          expand: 'sessions',

      };
      
      await this.$axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.page = response.data.page;

        useHead({
          title: this.page.seoTitle ? this.page.seoTitle : this.page.title,
          meta: [
            {
              name: 'description',
              content: this.page.seoDescription.replace(/<[^>]+>/g, '')
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


      <div class="hero common-hero" :style="{ 'background': background }">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="hero-ct" v-if="page.content">
                <h1>{{ page.seoTitle ? page.seoTitle : page.title }}</h1>
                <ul class="breadcumb">
                  <li class="active"><router-link to="/">Главная</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span>{{ page.seoTitle ? page.seoTitle : page.title }}</li>
                </ul>
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
              <div class="blog-detail-ct" v-if="page.content" v-html="page.content">
                
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end of  blog detail section-->
      

      <footerSection />
      
    </main>
</template>
