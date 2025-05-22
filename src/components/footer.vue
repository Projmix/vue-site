<script setup>
import { useLayoutStore } from "../stores/layout.js";
import { computed, onMounted } from 'vue';

const layoutStore = useLayoutStore();
const logoUrl = computed(() => layoutStore.getCompanyLogoUrl);
const layout = computed(() => layoutStore.getLayout);
const background = computed(() => layoutStore.getBackground);
const footerLinks = computed(() => layoutStore.getSiteFooterLinks);
const footerImages = computed(() => layoutStore.getSiteFooterImages);

// Google Translate init (через onMounted, без this)
onMounted(() => {
  if (!window._googleTranslateScriptLoading) {
    window._googleTranslateScriptLoading = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onerror = function() {
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
            <div class="col-lg-1">
              <div class="widget">
                <router-link class="footer-widget-logo" :to="{ name: 'home' }">
                  <img class="img-fluid" :src="logoUrl" alt="logo" style="width:179px; height:46px; object-fit:contain;">
                </router-link>
              </div>
            </div>
            <!-- Динамические ссылки футера из API -->
            <div class="col-lg-8">
            <div class="col-lg-3" v-for="(linkGroup, index) in footerLinks" :key="index">
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
          <div class="col-lg-3"></div>
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
.footer-top-area .container-fluid .col-lg-3:first-child{
  display: flex;
  align-items: center;
}
.footer-layout2 .footer-top-area .widget .footer-widget-logo{
  margin-bottom: 0px;
}

.footer-layout2 .footer-top-area .container .col-lg-8:first-child{
  display: flex;
  gap: 20px;
}

</style>
