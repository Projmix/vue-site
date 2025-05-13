<script setup>
import { useLayoutStore } from "../stores/layout.js";
import { computed, onMounted } from 'vue';

const layoutStore = useLayoutStore();
onMounted(() => {
  layoutStore.fetchCompanyInfo();
});
const logoUrl = computed(() => layoutStore.getCompanyLogoUrl);
const layout = computed(() => layoutStore.getLayout);
const filteredCategoriesData = computed(() => layoutStore.filteredCategoriesData);

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
                <router-link :to="{ name: 'home' }">
  <img :src="logoUrl" alt="logo" style="width:179px; height:46px; object-fit:contain;">
</router-link>
              </div>
            </div>
            <div class="col-lg-7 col-md-6 possition-static">
              <div class="eventalk-main-menu">
                <nav class="d-none d-lg-block">
                  <ul>
                    <li>
                      <router-link :to="{ name: 'home' }">Главная</router-link>
                    </li>
                    <li>
                      <a href="#">Афиша</a>
                      <ul v-if="filteredCategoriesData && Object.keys(filteredCategoriesData).length"
                        class="rt-dropdown-menu">
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
                      <router-link :to="{ name: 'sponsors' }">
                        О нас
                      </router-link>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu start -->
                <nav id="dropdown" class="d-md-none">
                  <ul>
                    <li>
                      <router-link :to="{ name: 'home' }">Главная</router-link>
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
                      <router-link :to="{ name: 'sponsors' }">
                        О нас
                      </router-link>
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
.eventalk-main-menu {
  padding-right: 22%;
}
</style>
