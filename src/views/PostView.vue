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
  name: "Post",
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
      post: {},
      loading: true,
    };
  },
  methods: {
    async getPost() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts/${this.$route.params.slug}`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          cityId: import.meta.env.VITE_API_CITY_ID,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
          expand: 'sessions'
      };

      
      await this.$axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.post = response.data;

        useHead({
          title: this.post.posts.seoTitle ? this.post.posts.seoTitle : this.post.posts.title,
          meta: [
            {
              name: 'description',
              content: this.post.posts.seoDescription.replace(/<[^>]+>/g, '')
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
      .then(() => this.getPost())
      .catch(error => console.error("Ошибка выполнения getPost", error));
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


      <div class="hero common-hero background-properties" v-if="post.posts" :style="{ 'background': `url(${post.posts.image['original']})` }">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="hero-ct">
                <h1>{{ post.posts.seoTitle ? post.posts.seoTitle : post.posts.title }}</h1>
                <ul class="breadcumb">
                  <li class="active"><router-link to="/">Главная</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span><router-link to="/posts">Новости</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span>{{ post.posts.seoTitle ? post.posts.seoTitle : post.posts.title }}</li>
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
            <div class="col-md-9 col-sm-12 col-xs-12">
              <div class="blog-detail-ct" v-if="post.posts" v-html="post.posts.content.markdown">
                
              </div>
            </div>
            <div class="col-md-3 col-sm-12 col-xs-12">
              <div class="sidebar">
                
                <div class="sb-recentpost sb-it" v-if="post.posts && post.posts.more">
                  <h4 class="sb-title">Популярное</h4>
                  <div class="recent-item" v-for="(subPost, index) in post.posts.more" :key="subPost">
                    <span>{{ String(index + 1).length == 1 ? `0${index + 1}` : index + 1 }}</span><h6><router-link :to="`/post/${subPost.slug}`">{{ subPost.title }}</router-link></h6>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end of  blog detail section-->
      

      <footerSection />
      
    </main>
</template>
