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
  name: "Events",
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
      events: {},
      calendar: [],
      loading: true,
      currentPage: 1,
      isMobile: false,
      date: null,
    };
  },
  computed: {
    soonFilms() {
      let result = [];
      if (this.events.data && this.events.data.month && this.events.data.month.length) {
        this.events.data.month.forEach(mon => {
          result.push(...mon.performances);
        });

        result = result.filter(perf => ((moment().startOf('day').unix() + 86400) <= perf.start_timestamp));

        return result;
      }
      return result;
    }
  },
  watch: {
    date: {
      handler(newValue, oldValue) {
        if (oldValue) {
          this.getEvents();
        }
      },
      deep: false
    },
  },
  methods: {
    async getEvents() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/kino`;
      const defaultDate = moment().startOf('day').unix();

      if (this.date) {
        if (moment(this.date).startOf('day').unix() == defaultDate) {
          this.$router.replace({'query': {'type': 'today'}});
        } else {
          this.$router.replace({'query': {'type': 'none'}});
        }
      }
  
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          ignoreEndTime: 0,
          cityId: import.meta.env.VITE_API_CITY_ID,
          date: this.date ? moment(this.date).startOf('day').unix() : defaultDate,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
      };

      
      await this.$axios.get(apiUrl, { params }).then(response => {

        this.events = response.data;

        if (this.calendar.length < response.data.calendar.length) {
          this.calendar = response.data.calendar;
        }

        useHead({
          title: 'Мероприятия',
          meta: [
            {
              name: 'description',
              content: 'Мероприятия'
            }
          ]
        });

        if (!this.date) {
          this.date = this.calendar[0];
        }

        
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

    changeRoute(type) {
      this.date = null;
      this.$router.push(`/events?type=${type}`);
    }
    
  },
  beforeMount() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    }
    this.layoutLoaded
      .then(() => this.getEvents())
      .catch(error => console.error("Ошибка выполнения getEvents", error));
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
                <h1>Мероприятия</h1>
                <ul class="breadcumb">
                  <li class="active"><router-link to="/">Главная</router-link></li>
                  <li> <span class="ion-ios-arrow-right"></span>Мероприятия</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="page-single" v-if="events.data">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12 col-xs-12">
              <div class="topbar-filter fw">
                <p>Найдено мероприятий: &nbsp;<span>{{ ($route.query.type && $route.query.type == 'soon') ? soonFilms.length : events.data.currentDate.length }}</span></p>
                <div class="filter-wrapper">
                  <label @click="changeRoute('today')" :class="{ 'active': $route.query.type && $route.query.type == 'today' }">Сегодня в кино</label>
                  <label @click="changeRoute('soon')" :class="{ 'active': $route.query.type && $route.query.type == 'soon' }">Скоро в кино</label>
                </div>
                
                <VueDatePicker class="events-datepicker" v-model="date" format="dd.MM.yyyy" id="datePicker" :enable-time-picker="false" hide-offset-dates :allowed-dates="calendar" locale="ru" :space-confirm="false" auto-apply></VueDatePicker>
                
              </div>
              <div class="flex-wrap-movielist mv-grid-fw">
                  <div class="movie-item-style-2 movie-item-style-1" v-for="event in (($route.query.type && $route.query.type == 'soon') ? soonFilms : events.data.currentDate)" :key="event">
                    <img :src="event.image['240x340']" alt="" @click="$router.push(`/event/${event.id}`)">
                    <div class="hvr-inner">
                            <router-link :to="`/event/${event.id}`"> Купить <i class="ion-android-arrow-dropright"></i> </router-link>
                          </div>
                    <div class="mv-item-infor">
                      <h6><router-link :to="`/event/${event.id}`">{{ event.name }}</router-link></h6>
                      <p class="rate" v-if="event.kinopoisk_rank"><i class="ion-android-star"></i><span>{{ event.kinopoisk_rank.toFixed(2) }}</span> /10</p>
                    </div>
                  </div>					
                  
                  
              </div>		
              
            </div>
          </div>
        </div>
      </div>

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
