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
const eventCategories = computed(() => layoutStore.getEventCategories);
const siteMenu = computed(() => layoutStore.getSiteMenu);

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
                    <!-- Динамическое меню из API -->
                    <li v-for="item in siteMenu" :key="item.href">
                      <router-link v-if="item.href.startsWith('/')" :to="item.href" :title="item.title">
                        {{ item.text }}
                      </router-link>
                      <a v-else :href="item.href" :title="item.title" :target="item.target">
                        {{ item.text }}
                      </a>
                      
                      <!-- Специальная обработка для пункта "Афиша" - показываем выпадающий список категорий -->
                      <ul v-if="item.text === 'Афиша' && eventCategories && eventCategories.length"
                        class="rt-dropdown-menu">
                        <li v-for="cat in eventCategories" :key="cat.slug">
                          <router-link :to="`/afisha/${cat.slug}`">
                            {{ cat.name }}
                          </router-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu start -->
                <nav id="dropdown" class="d-md-none">
                  <ul>
                    <!-- Динамическое меню для мобильных из API -->
                    <li v-for="item in siteMenu" :key="item.href">
                      <router-link v-if="item.href.startsWith('/')" :to="item.href" :title="item.title">
                        {{ item.text }}
                      </router-link>
                      <a v-else :href="item.href" :title="item.title" :target="item.target">
                        {{ item.text }}
                      </a>
                      
                      <!-- Специальная обработка для пункта "Афиша" - показываем выпадающий список категорий -->
                      <ul v-if="item.text === 'Афиша' && eventCategories && eventCategories.length"
                        class="rt-dropdown-menu">
                        <li v-for="cat in eventCategories" :key="cat.slug">
                          <router-link :to="`/afisha/${cat.slug}`">
                            {{ cat.name }}
                          </router-link>
                        </li>
                      </ul>
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
