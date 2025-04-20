<script>
import { reactive, toRaw, onMounted, onBeforeUnmount } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { computed } from 'vue';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { useHead } from '@vueuse/head';
import '@splidejs/vue-splide/css';
import moment from 'moment';
import ru from 'moment/locale/ru';
export default {
  name: "Home",
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

    const layout = computed(() => layoutStore.getLayout);

    onMounted(() => {
      // Инициализация jQuery-плагинов только после того, как DOM готов
      if (window.$ && typeof window.$.fn.meanmenu === 'function') {
        $('nav#dropdown').meanmenu({
          siteLogo: "<div class='mobile-menu-nav-back'><a href='index.html'><img src='../assets/images/logo.png'/></a></div>"
        });
      }
      if (window.$ && typeof window.$.scrollUp === 'function') {
        $.scrollUp({
          scrollText: '<i class="fa fa-angle-up"></i><p>TOP</p>',
          easingType: 'linear',
          scrollSpeed: 900,
        });
      }
    });

    onBeforeUnmount(() => {
      // destroy
    });

    return {
      layout,
      background,
      logo,
      logo2
    };
  },
  props: ['layoutLoaded'],
  computed: {
    soonFilms() {
      let result = [];
      if (this.afisha.data && this.afisha.data.month && this.afisha.data.month.length) {
        this.afisha.data.month.forEach(mon => {
          result.push(...mon.performances);
        });

        result = result.filter(perf => ((moment().startOf('day').unix() + 86400) <= perf.start_timestamp));

        if (result.length > 8) {
          result = result.slice(0, 8);
        }

        return result;
      }
      return result;
    }
  },
  data() {
    return {
      afisha: {},
      loading: true,
      splideOptionsEvents: {
        type: 'slide',
        perPage: 6,
        breakpoints: {
          600: {
            perPage: 2,
            gap: '1rem',
          },
        },
        pagination: false,
        arrows: false,
      },
      splideOptionsBanner: {
        type: 'slide',
        perPage: 1,
        pagination: false,
        arrows: false,
      },
      tagColors: [
        'blue',
        'yell',
        'orange',
        'green'
      ],

    };
  },
  methods: {
    async getAfisha() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/kino`;
      const params = {
        lang: import.meta.env.VITE_API_LANG,
        jsonld: import.meta.env.VITE_API_JSONLD,
        ignoreEndTime: 0,
        cityId: import.meta.env.VITE_API_CITY_ID,
        date: moment().startOf('day').unix(),

        onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
        domain: import.meta.env.VITE_API_DOMAIN,
        distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
        // expand: 'sessions'


        // ignoreEndTime: 1,
        // home_sort: 1,
        // limit: 12,
        // onlyData:0,
      };


      await this.$axios.get(apiUrl, { params }).then(response => {
        console.log('API AFISHA:', response.data);
        this.afisha = response.data;

        useHead({
          title: 'Киноафиша Бобруйска – Кинотеатры "Товарищ" и "Мир" | Купить билеты онлайн',
          meta: [
            {
              name: 'description',
              content: 'Актуальная киноафиша города Бобруйска. Расписание сеансов в кинотеатрах "Товарищ" и "Мир". Покупка билетов онлайн, трейлеры, описания фильмов и удобный выбор мест.'
            },
            {
              name: 'keywords',
              content: 'кино Бобруйск, кинотеатр Товарищ, кинотеатр Мир, купить билеты в кино, афиша Бобруйск, фильмы сегодня, расписание кино'
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
    formatDate(date, format = 'DD MMM') {
      return moment(date).format(format);
    },
  },
  beforeMount() {
    this.layoutLoaded
      .then(() => this.getAfisha())
      // .then(() => {
      //   requestAnimationFrame(() => {
      //     setTimeout(() => {
      //       this.loading = false;
      //     }, 700);
      //   });
      // })
      .catch(error => console.error("Ошибка выполнения getAfisha", error));
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

    <!-- Slider Area Start Here -->
    <div class="slider-area slider-layout4 slider-direction-layout2" id="fixed-type-slider">
      <div class="bend niceties preview-1">
        <div id="ensign-nivoslider-3" class="slides">
          <img src="@/assets/images/slider/slide4-1.jpg" alt="slider" title="#slider-direction-1" />
          <img src="@/assets/images/slider/slide4-2.jpg" alt="slider" title="#slider-direction-2" />
          <img src="@/assets/images/slider/slide4-3.jpg" alt="slider" title="#slider-direction-3" />
        </div>
        <div id="slider-direction-1" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-1">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
                <div class="slider-btn-area forth-line margin-t-30">
                  <a href="#" class="btn-ghost color-yellow">Buy Tickets Now!</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="slider-direction-2" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-2">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
                <div class="slider-btn-area forth-line margin-t-30">
                  <a href="#" class="btn-ghost color-yellow">Buy Tickets Now!</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="slider-direction-3" class="t-cn slider-direction">
          <div class="slider-content s-tb slide-3">
            <div class="title-container s-tb-c title-light">
              <div class="container text-left">
                <div class="slider-big-text first-line">
                  <p>Application</p>
                </div>
                <div class="slider-big-text second-line">
                  <p>Developer Meetup 2018</p>
                </div>
                <div class="slider-btn-area forth-line margin-t-30">
                  <a href="#" class="btn-ghost color-yellow">Buy Tickets Now!</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Slider Area End Here -->
    <!-- Countdown Area Start Here -->
    <section>
      <div class="container-fluid">
        <div class="row no-gutters full-width">
          <div class="col-lg-4">
            <div class="height-100 d-flex align-items-center bg-primary">
              <div class="upcoming-event-layout2 zindex-up">
                <h2>East Tobaco</h2>
                <div class="event-location">26 Street, London</div>
                <div class="event-date">17 October - 22 Octber, 2018</div>
              </div>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="countdown-layout1">
              <div id="countdown"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Countdown Area End Here -->
    <!-- About Area Start Here -->
    <section class="section-space-custom-less30 bg-common bg-accent"
      style="background-image: url(img/figure/figure3.png);">
      <div class="container-fluid">
        <div class="about-layout3">
          <img src="@/assets/images/about/about-logo.png" alt="logo" class="img-fluid">
          <p>Emply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
            dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled
            simply dummy text of the rinting and typesetting industry.standard dummy text ever since.Emply
            dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
            when an unknown printer took.</p>
        </div>
      </div>
    </section>
    <!-- About Page Area End Here -->
    <!-- Schedule Area Start Here -->
    <section class="section-space-top-default bg-light">
      <div class="container-fluid">
        <div class="section-heading title-black color-dark text-center">
          <h2>Event Schedule &amp; Agenda</h2>
          <p>Dorem ipsum dolor sit. Incidunt laborum beatae earum nihil odio consequatur</p>
        </div>
        <div class="row no-gutters full-width">
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back1.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">17 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Linex StartUp</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Steven John</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>CityCafe</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back2.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">18 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Admin Dashboard</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Lara Josef</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>Oporajita</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-12">
            <div class="schedule-layout4 bg-common"
              style="background-image: url(@/assets/images/schedule/schedule-back3.jpg);">
              <div class="item-content zindex-up">
                <ul>
                  <li>
                    <h3 class="title title-bold color-light hover-yellow size-xl">
                      <a href="single-event.html">10 October, 2018</a>
                    </h3>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-xl">Linex StartUp</h3>
                    <p>10.00 pm - 11.00pm</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Justin Teak</h3>
                    <p>Speaker</p>
                  </li>
                  <li>
                    <h3 class="title title-regular color-light size-lg">Hall</h3>
                    <p>CityCafe</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Schedule Area End Here -->
    <!-- Speaker Area Start Here (Сегодня в кино) -->
    <section class="section-space-default bg-light overlay-icon-layout4"
      v-if="afisha && afisha.data && afisha.data.currentDate.length">
      <div class="container-fluid zindex-up zoom-gallery menu-list-wrapper">
        <div class="section-heading title-black color-dark text-center">
          <h2>Сегодня в кино</h2>
          <p>Актуальные фильмы на сегодня</p>
        </div>
        <div class="row gutters full-width menu-list">
          <div
            v-for="event in ((afisha.data.currentDate.length > 8) ? afisha.data.currentDate.slice(0, 8) : afisha.data.currentDate)"
            :key="event.id" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 menu-item">
            <div class="speaker-layout3">
              <img :src="event.image['300x430']" :alt="event.name" class="img-fluid" />
              <div class="item-title">
                <h3 class="title title-medium color-light hover-yellow size-md">
                  <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
                </h3>
                <div class="text-left title-light size-md color-light">{{ event.genre }}</div>
              </div>
              <div class="item-social">
                <ul>
                  <li>
                    <span v-if="event.kinopoisk_rank" class="kp-rating">
                      <span class="kp-star">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="#fad03b"
                          xmlns="http://www.w3.org/2000/svg">
                          <polygon
                            points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,19.02 10,15.6 4.18,19.02 6,12.14 0.49,7.64 7.41,7.36" />
                        </svg>
                      </span>
                      <span class="kp-value">{{ event.kinopoisk_rank.toFixed(1) }}</span>
                      <span class="kp-max">/10</span>
                    </span>
                  </li>
                  <li>
                    <a href="#" title="twitter">
                      <i class="fa fa-twitter" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" title="linkedin">
                      <i class="fa fa-linkedin" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" title="pinterest">
                      <i class="fa fa-pinterest" aria-hidden="true"></i>
                    </a>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <a href="#" title="More Speakers"
              class="loadmore-four-item btn-fill border-radius-5 size-lg color-yellow margin-t-30">More Speakers</a>
          </div>
        </div>
      </div>
    </section>
    <!-- End Speaker Area -->
    <!-- Progress Area Start Here -->
    <section class="section-space-md bg-common progress-bg-color"
      style="background-image: url(@/assets/images/figure/figure6.png);">
      <div class="container-fluid">
        <div class="row no-gutters">
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-map-marker" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>Tobacco, London</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-users" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>30+ Speakers</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-12">
            <div class="progress-layout2">
              <div class="media media-none-mb">
                <div class="item-icon">
                  <i class="fa fa-clone" aria-hidden="true"></i>
                </div>
                <div class="media-body">
                  <h3>15+ Main Sponsor</h3>
                  <p>PO Box 16122 Collins Street West Victoria 8007 Newyork</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Progress Area End Here -->
    <!-- Pricing Plan Area Start Here -->
    <section class="section-space-default-less30 overlay-icon-layout2 bg-common bg-accent"
      style="background-image: url(@/assets/images/figure/figure5.png);">
      <div class="container zindex-up">
        <div class="section-heading title-black color-dark text-center">
          <h2>Ticket Price &amp; Plan</h2>
          <p>Dorem ipsum dolor sit. Incidunt laborum beatae earum nihil odio consequatur officiis tempore</p>
        </div>
        <div class="row">
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Personal Plan</h3>
                </div>
                <div class="item-price">49
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-yellow border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Business Plan</h3>
                </div>
                <div class="item-price">69
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-primary border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-sm-12">
            <div class="price-table-layout1">
              <div class="item-wrapper">
                <div class="item-title">
                  <h3 class="title-medium color-dark text-uppercase">Premium Plan</h3>
                </div>
                <div class="item-price">99
                  <span class="currency">$</span>
                </div>
                <div class="item-body">
                  <ul>
                    <li>Entrance</li>
                    <li>Coffee Break</li>
                    <li>Certificate</li>
                    <li>Workshop</li>
                  </ul>
                </div>
                <a href="#" title="Buy Ticket" class="btn-fill size-md color-green border-radius-5">Buy Ticket</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Pricing Plan Area End Here -->
    <!-- Sponsonrs Area Start Here -->
    <section class="section-space-default bg-light">
      <div class="container">
        <div class="section-heading title-black color-dark text-center">
          <h2>Offcial Sponsonrs &amp; Partner</h2>
          <p>Check Who Makes This Event Possible!</p>
        </div>
        <div class="sponsonrs-layout1">
          <div class="row">
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand1.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand2.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand3.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand4.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand5.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand6.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand7.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 col-12">
              <div class="sponsonrs-box">
                <a href="#">
                  <img src="@/assets/images/brand/brand8.png" alt="brand" class="img-fluid">
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <a href="#" title="Become a Sponsors"
              class="btn-fill size-lg border-radius-5 color-yellow margin-t-30">Become a Sponsors</a>
          </div>
        </div>
      </div>
    </section>
    <!-- Sponsonrs Area End Here -->
    <!-- Call To Action Area Start Here -->
    <section class="overlay-primary90 overlay-icon-layout1 section-space-default"
      style="background-image: url(img/figure/figure1.jpg);">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="call-to-action-layout1 zindex-up">
              <h2>Get Your Ticket Now</h2>
              <p>Adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim
                ad minim veniam, quis nostrud exercitation.</p>
              <a href="#" title="Buy Tickets" class="btn-fill size-lg border-radius-5 color-yellow">Buy Tickets</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Call To Action Area End Here -->

    <!-- Blog Area Start Here -->
    <section class="section-space-default-less30 bg-common bg-accent"
      v-if="afisha && afisha.postsAll && afisha.postsAll.length">
      <div class="container-fluid">
        <div class="section-heading title-black color-dark text-center">
          <h2>Последние новости</h2>
          <p>Новости и обновления киноафиши</p>
        </div>
        <div class="row gutters-15 full-width">
          <div v-for="post in afisha.postsAll" :key="post.slug" class="col-xl-4 col-lg-5 col-md-6 col-sm-6">
            <div class="blog-layout3 overlay-gradient">
              <router-link :to="`/post/${post.slug}`">
                <img :src="post.image['1300x560']" :alt="post.title" class="img-fluid width-100">
              </router-link>
              <div class="item-date-wrap">
                <div class="item-date">
                  {{ formatDate(post.publishedAt, 'DD MMM') }}
                </div>
              </div>
              <div class="item-content">
                <div class="item-title">
                  <h3 class="title-medium color-light hover-yellow">
                    <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
                  </h3>
                </div>
                <div class="item-deccription">
                  <p v-html="post.shortContent"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- End Blog Area -->
    <!-- Map Area Start Here -->
    <section class="full-width-container">
      <div class="container-fluid">
        <div class="google-map-area">
          <div id="googleMap" style="width:100%; height:496px;"></div>
          <div class="upcoming-event-layout1">
            <h2>Marketing
              <br> Conferance 2018
            </h2>
            <div class="date">17 - 25 Oct, 2018</div>
            <p>Tobacco Dock, London</p>
          </div>
        </div>
      </div>
    </section>
    <!-- Map Area End Here -->


    <footerSection />

  </main>
</template>


<style scoped>
.kp-rating {
  display: inline-flex;
  align-items: center;
  background: #fff7e0;
  color: #222;
  border-radius: 1.2em;
  padding: 0.15em 0.7em 0.15em 0.4em;
  font-weight: 600;
  font-size: 1.04em;
  box-shadow: 0 2px 8px 0 rgba(250, 208, 59, 0.09);
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
  color: #b7a96d;
  font-size: 0.97em;
  margin-left: 0.08em;
}
</style>