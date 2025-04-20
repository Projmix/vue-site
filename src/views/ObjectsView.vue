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
  name: "Objects",
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
      objects: [],
      seo: {},
      loading: true,
      isMobile: false
    };
  },
  methods: {
    async getObjects() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/pages/objects?filter[typeIds]=2&filter[perPage]=18&page=1`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          cityId: import.meta.env.VITE_API_CITY_ID,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
      };

      
      await this.$axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.objects = response.data.data;
        this.seo = response.data.seo;

        useHead({
          title: (this.seo && this.seo.seoTitle) ? this.seo.seoTitle : this.seo.name,
          meta: [
            {
              name: 'description',
              content: (this.seo && this.seo.seoDescription ? this.seo.seoDescription.replace(/<[^>]+>/g, '') : '')
            }
          ]
        });
        
      });

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
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    }
    this.layoutLoaded
      .then(() => this.getObjects())
      .catch(error => console.error("Ошибка выполнения getObjects", error));
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
                <h1>Объекты</h1>
                <ul class="breadcumb">
                  <li class="active"><router-link to="/">Главная</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span>Объекты</li>
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
            <div class="col-md-12 col-sm-12 col-xs-12" v-if="objects && objects.data">
              <div class="row row-objects">
                <div class="col-md-4 col-sm-12 col-xs-12" v-for="(object) in objects.data" :key="object">
                  <div class="blog-item-style-2">
                    <router-link :to="`/object/${object.id}`"><img :src="object.image['420x300']" alt=""></router-link>
                    <div class="blog-it-infor">
                      <h3><router-link :to="`/object/${object.id}`">{{ object.name }}</router-link></h3>
                      <span class="time">{{ object.address }}</span>
                      <p class="cut-description" v-html="object.shortDescription"></p>
                    </div>
                  </div>
                </div>
              </div>
              
             
              
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
