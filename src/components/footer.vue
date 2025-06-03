<script setup>
import { useLayoutStore } from "../stores/layout.js";
import { computed, onMounted } from 'vue';

const layoutStore = useLayoutStore();
// logoUrl can be removed if not used elsewhere in this component, or kept if header still relies on a similar setup.
// For the footer logos, we will use footerImages directly.
// const logoUrl = computed(() => layoutStore.getCompanyLogoUrl); 
const layout = computed(() => layoutStore.getLayout);
const background = computed(() => layoutStore.getBackground);
const footerLinks = computed(() => layoutStore.getSiteFooterLinks);
const footerImages = computed(() => layoutStore.getSiteFooterImages); // This is the one we need for all logos

// Google Translate init (через onMounted, без this)
onMounted(() => {
  if (!window._googleTranslateScriptLoading) {
    window._googleTranslateScriptLoading = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onerror = function () {
      console.error('Google Translate script failed to load.');
    };
    document.head.appendChild(script);
  }
  window.googleTranslateElementInit = function () {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'ru',
        includedLanguages: 'ar,en,es,fr,km,ru,sq,vi,zh-CN,be',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        multilanguagePage: true,
        gaTrack: true,
      }, 'google_translate_element');
    } else {
      console.error('Google Translate API is not available.');
    }
  };
  // Обработчик кликов для меню перевода
  setTimeout(() => {
    document.querySelectorAll('.langsList a').forEach((element) => {
      element.addEventListener('click', (event) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=`;
        if (event.target.textContent === 'РУС') {
          setTimeout(() => {
            window.location.href = window.location.origin + window.location.pathname + window.location.search;
          }, 800);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }
      });
    });
  }, 1000);
});
</script>

<template>
  <!-- footer v2 section-->
  <footer class="ht-footer full-width-ft" :style="{ 'background': background }">
    <div class="footer-layout2">
      <div class="footer-top-area footer-box-layout">
        <div class="container">
          <div class="row">
            <div class="col-lg-2">
              <div class="widget">
                <!-- Loop through all siteFooterImages -->
                <div v-for="logoItem in footerImages" :key="logoItem.image || logoItem.href" class="footer-logo-item">
                  <a :href="logoItem.href" :target="logoItem.target || '_self'" :title="logoItem.title" class="footer-widget-logo d-block">
                    <img :src="logoItem.image" 
                         :alt="logoItem.title || 'logo'"
                         style="width: 100%; height: auto; object-fit: contain; display: block;">
                  </a>
                </div>
              </div>
            </div>
            <!-- Динамические ссылки футера из API -->
            <div class="col-lg-8">
              <div class="col-lg-4" v-for="(linkGroup, index) in footerLinks" :key="index">
                <div class="widget">
                  <h3 class="widgettitle">{{ linkGroup.text }}</h3>
                  <div class="footer-widget-menu" v-if="linkGroup.children && linkGroup.children.length">
                    <ul>
                      <li v-for="(link, linkIdx) in linkGroup.children" :key="linkIdx">
                        <router-link v-if="link.href.startsWith('/')" :to="link.href" :title="link.title">
                          {{ link.text }}
                        </router-link>
                        <a v-else :href="link.href" :title="link.title" :target="link.target || '_self'">
                          {{ link.text }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom-area footer-box-layout">
      <p>© 2012-2025 "Arcom Group". Все права защищены.</p>
    </div>
    </div>
  </footer>
  <!-- end of footer v2 section-->
</template>

<style scoped>
.footer-top-area .container-fluid .col-lg-3:first-child {
  display: flex;
  align-items: center;
}

.footer-layout2 .footer-top-area .widget .footer-widget-logo {
  margin-bottom: 0px;
}

.footer-layout2 .footer-top-area .container .col-lg-8 {
  display: flex;
  gap: 20px;
}

.footer-logo-item {
  margin-bottom: 15px; /* Space between logos */
  width: 100%; /* Ensure the container item takes full width */
}

.footer-logo-item:last-child {
  margin-bottom: 0;
}

/* Ensure the anchor tag itself doesn't have conflicting margins from general rules */
.footer-layout2 .footer-top-area .widget .footer-widget-logo.d-block {
  margin-bottom: 0; 
}

@media (max-width: 991px) {
  .footer-layout2 .footer-top-area .container .col-lg-2{
    margin-left: 20px !important;
  }
  .footer-layout2 .footer-top-area .container .col-lg-8 {
  flex-wrap: wrap;
}
}
</style>
