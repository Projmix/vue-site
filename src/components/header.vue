<script>
import { useLayoutStore } from "../stores/layout.js";
import { computed } from 'vue';

export default {
  name: "Header",
  setup() {
    const store = useLayoutStore();
    const layout = computed(() => store.getLayout);
    const logo = computed(() => store.getLogo);
    const filteredCategoriesData = computed(() => store.filteredCategoriesData);
    console.log('[header.vue] filteredCategoriesData', filteredCategoriesData.value);
    return {
      layout,
      logo,
      filteredCategoriesData
    };
  },
  data() {
    return {
    };
  },
  methods: {
  },
  beforeMount() {
  },
};
</script>

<template>
  <!-- BEGIN | Header -->
<!-- Категории афиши с элементами -->


  <header class="ht-header full-width-hd">

    <div id="header-one" class="header-area header-fixed full-width-compress">
                    <div class="main-menu-area" id="sticker">
                        <div class="container-fluid">
                            <div class="row no-gutters d-flex align-items-center">
                                <div class="col-lg-2 col-md-2 d-none d-lg-block">
                                    <div class="logo-area">
                                        <a href="index.html">
                                            <img src="../assets/images/logo.png" alt="logo">
                                        </a>
                                    </div>
                                </div>
                                <div class="col-lg-7 col-md-6 possition-static">
                                    <div class="eventalk-main-menu">
                                        <nav class="d-none d-lg-block">
                                            <ul>
                                              <li>
                                                    <a href="home.html">Главная</a>
                                                </li>
                                                <li>
                                                    <a href="#">Афиша</a>
                                                    <ul v-if="filteredCategoriesData && Object.keys(filteredCategoriesData).length" class="rt-dropdown-menu">
  <li v-for="(cat, slug) in filteredCategoriesData" :key="slug">
    <router-link :to="{ name: 'events-category', params: { category: slug } }">
      {{ cat.name }}
    </router-link>
  </li>
</ul>
                                                </li>
                                                <li>
                                                  <router-link :to="{ name: 'posts' }">
                                                    Новости
                                                  </router-link>
                                                </li>
                                                <li>
                                                    <a href="contact.html">О нас</a>
                                                </li>
                                            </ul>
                                        </nav>
                                        <!-- Mobile Menu start -->
                                        <nav id="dropdown" class="d-md-none">
                                            <ul>
                                              <li>
                                                    <a href="home.html">Главная</a>
                                                </li>
                                                <li>
                                                    <a href="#">Афиша</a>
                                                    <ul class="rt-dropdown-menu">
                                                        <li v-for="(cat, slug) in filteredCategoriesData" :key="slug">
  <router-link :to="{ name: 'events-category', params: { category: slug } }">
    {{ cat.name }}
  </router-link>
</li>
                                                    </ul>
                                                </li>
                                                <li>
                                                    <a href="news.html">Новости</a>
                                                </li>
                                                <li>
                                                    <a href="contact.html">О нас</a>
                                                </li>
                                            </ul>
                                        </nav>
                                        <!-- Mobile Menu End -->
                                    </div>
                                </div>
                                <div class="col-lg-3 col-md-4 d-none d-lg-block">
                                    <ul class="header-action-items">
                                        <li>
                                            <a href="#" title="Buy Tickets" class="btn-fill size-xs color-yellow border-radius-5">Buy Tickets</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
  </header>
  <!-- END | Header -->
</template>

<style scoped>
.eventalk-main-menu{
  padding-right: 22%;
}
</style>
