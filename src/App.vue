<script>
import { RouterLink, RouterView } from 'vue-router'
import { useFavicon } from '@vueuse/core'
import { useLayoutStore } from "./stores/layout.js";
import { useWidgetStore } from "./stores/widget.js";
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import Widget from './components/widget.vue'
import apiService from './services/apiService';

// REMINDER: User should import their fallback CSS here, e.g.:
// import '@/assets/css/24afisha.by.css';

export default {
  name: "App",
  setup() {
    const router = useRouter();
    const layoutStore = useLayoutStore();
    const widgetStore = useWidgetStore();
    const layout = computed(() => layoutStore.getLayout);
    const background = computed(() => layoutStore.getBackground);

    const showWidget = computed(() => widgetStore.open);
    const idWidget = computed(() => widgetStore.id);
    const seidWidget = computed(() => widgetStore.seid);
    const iidWidget = computed(() => widgetStore.iid);
    const pidWidget = computed(() => widgetStore.pid);
    const cidWidget = computed(() => widgetStore.cid);
    const closeFrame = () => widgetStore.close();

    const icon = useFavicon();
    icon.value = `/src/assets/images/${window.location.hostname}/favicon.ico?v=3`;


    router.afterEach((to, from) => {
      layoutStore.loadExternalScripts();
    });
    return {
      showWidget,
      idWidget,
      seidWidget,
      iidWidget,
      pidWidget,
      cidWidget,

      layout,
      background,
      fetchLayout: layoutStore.fetchLayout,
      loadExternalScripts: layoutStore.loadExternalScripts,
      closeFrame
    };
  },
  components: {
    Widget,
  },
  data() {
    return {
      layoutLoaded: null,
    };
  },
  
  methods: {
    applyDynamicThemeCss(cssText, source) {
      const themeStyleTagId = 'dynamic-theme-styles';
      let styleTag = document.getElementById(themeStyleTagId);
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = themeStyleTagId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = cssText;
      console.log(`[Theme] Applied CSS from ${source}`);
    },

    removeDynamicThemeCss() {
      const themeStyleTagId = 'dynamic-theme-styles';
      const styleTag = document.getElementById(themeStyleTagId);
      if (styleTag) {
        styleTag.remove();
        console.log('[Theme] Removed dynamic CSS tag.');
      }
    },

    async loadAndApplyTheme() {
      const hostname = window.location.hostname;
      const themeCacheKey = `dynamicThemeCss_${hostname}`;

      try {
        console.log(`[Theme] Attempting to fetch theme CSS for ${hostname} from API.`);
        const fetchedCss = await apiService.getThemeCss(hostname);
        
        if (fetchedCss && typeof fetchedCss === 'string') {
          localStorage.setItem(themeCacheKey, fetchedCss);
          this.applyDynamicThemeCss(fetchedCss, 'API');
        } else {
          // This case handles API success (200) but empty/invalid CSS string from apiService.getThemeCss which returns null in such cases
          console.warn('[Theme] Fetched theme was null or not a valid CSS string. Trying cache.');
          // Force to catch block to attempt cache load
          throw new Error("Fetched theme was null or invalid, try cache"); 
        }
      } catch (error) {
        // This catch block handles failures from apiService.getThemeCss (network errors, 404s, etc.)
        // OR the explicitly thrown error from the try block above
        console.warn(`[Theme] Failed to get theme CSS from API (or API returned no CSS): ${error.message}. Trying cache.`);
        const cachedCss = localStorage.getItem(themeCacheKey);
        if (cachedCss) {
          this.applyDynamicThemeCss(cachedCss, 'localStorage cache');
        } else {
          console.warn('[Theme] No cached theme CSS found. Fallback CSS (if linked globally) will apply.');
          // Ensure no stale dynamic styles are present if both API and cache fail, allowing fallback to take over cleanly.
          this.removeDynamicThemeCss();
        }
      }
    },

    async loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Ошибка загрузки скрипта: ${src}`));
        document.head.appendChild(script);
        
      });
    },
  },
  beforeMount() {
    let customCSS = document.createElement('link');
    customCSS.rel = 'stylesheet';
    customCSS.href = `/src/assets/css/${window.location.hostname}/custom.css?v=2`;
    document.head.appendChild(customCSS);

    // Load dynamic theme CSS variables
    this.loadAndApplyTheme();

    if (!this.layout) {
      this.layoutLoaded = this.fetchLayout()
        .then(() => this.loadExternalScripts())
        .catch(error => console.error("Ошибка загрузки скриптов", error));
    }
    
  },
  async mounted() {
    const domain = window.location.hostname;
    try {
      // Динамический импорт на основе домена
      const { initYandexMetrika } = await import(`/src/components/metrics/${domain}/yandex.js`);
      initYandexMetrika();
    } catch (error) {
      console.error(`Не удалось загрузить Yandex Metrika для домена: ${domain}`, error);
    }

    try {
      // Динамический импорт на основе домена
      const { initGoogleMetrika } = await import(`/src/components/metrics/${domain}/google.js`);
      initGoogleMetrika();
    } catch (error) {
      console.error(`Не удалось загрузить Google Metrika для домена: ${domain}`, error);
    }
  }
};
</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

  <RouterView :layoutLoaded="layoutLoaded" :key="$route.fullPath" />
  <Widget v-if="showWidget" :sid="idWidget" :seid="seidWidget" :iid="iidWidget" :pid="pidWidget" :cid="cidWidget" @close="closeFrame"></Widget>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>