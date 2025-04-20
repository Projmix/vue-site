<script>
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { computed } from 'vue';
export default {
  name: "Error",
  components: {
    headerSection,
    footerSection,
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
  
  data() {
    
  },
  methods: {
    
    
  },
  beforeMount() {
    
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

      <!-- <headerSection /> -->

      <div class="page-single-2" :style="{ 'background': background }">
        <div class="container">
          <div class="row">
            <div class="middle-content">
              <router-link to="/"><img class="md-logo" :src="logo" alt=""></router-link>
              <!-- <img src="../assets/images/ft-bg1.png" alt=""> -->
              <h1>Страница не найдена</h1>
              <router-link to="/" class="redbtn">На главную</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- <footerSection /> -->
      
    </main>
</template>
