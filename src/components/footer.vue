<script>
import { useLayoutStore } from "../stores/layout.js";
import { computed } from 'vue';

export default {
  name: "Header",
  setup() {
    const store = useLayoutStore();
    const layout = computed(() => store.getLayout);
    const background = computed(() => store.getBackground);
    const logo = computed(() => store.getLogo);
    return {
      layout,
      background,
      logo
    };
  },
  data() {
    return {
    };
  },
  methods: {
  },
  beforeMount() {
    // Динамически загружаем скрипт Google Translate
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);

    const scriptLidrekon = document.createElement('script');
    scriptLidrekon.type = 'text/javascript';
    scriptLidrekon.src = 'https://lidrekon.ru/slep/js/uhpv-full.min.js';
    document.head.appendChild(scriptLidrekon);

    // Инициализация Google Translate
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: 'ru',
        includedLanguages: 'ar,en,es,fr,km,ru,sq,vi,zh-CN,be',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        multilanguagePage: true,
        gaTrack: true,
      }, 'google_translate_element');
    };

    // Функция удаления куки
    const deleteCookie = (cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=`;
    };

    // Обработчик кликов для меню перевода
    this.$nextTick(() => {
      document.querySelectorAll('.langsList a').forEach((element) => {
        element.addEventListener('click', (event) => {
          deleteCookie('googtrans');
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
    });
  },
};
</script>

<template>
  <!-- footer v2 section-->
  <footer class="ht-footer full-width-ft" :style="{ 'background': background }">
    <div class="row">
      <div class="flex-parent-ft">
        <div class="flex-child-ft item1">
          <router-link to="/"><img class="logo main-logo" :src="logo" alt=""></router-link>
          
          <div class="d-flex align-items-center">
            <ul class="langsList">
                <li><a notranslate class="language-item__link" href="#googtrans/ru"><span translate="no">РУС</span></a></li>
                <li><a notranslate class="language-item__link" href="#googtrans/en"><span translate="no">ENG</span></a></li>
                <li><a notranslate class="language-item__link" href="#googtrans/be"><span translate="no">БЕЛ</span></a></li>
            </ul>
          </div>

          <div class="d-flex align-items-center">
            <ul class="langsList">
                <li><a href="#" id="specialButton">Версия для слабовидящих</a></li>
            </ul>
          </div>

          <a href="https://www.slivki.by/"><img class="logo" src="/src/assets/images/slivki.svg" alt="slivki" style="margin-left: -15px;width:200px;"></a>
        </div>
        <div class="flex-child-ft item2">
          <h4>Быстрые ссылки</h4>
          <ul v-if="layout && layout.footer && layout.footer.quick_links">
            <li v-for="link in layout.footer.quick_links.filter(item => item.url != 'http://качество-услуг.бел')" :key="link"><a :href="link.url">{{ link.name }}</a></li> 
          </ul>
        </div>
        <div class="flex-child-ft item3">
          <h4>Обращения</h4>
          <ul>
            <li><a href="http://качество-услуг.бел">Оцените качество услуг</a></li>  
          </ul>
        </div>
        <div class="flex-child-ft item4">
          <div class="images-wrapper">
            <a href="https://president.gov.by/ru/documents/ukaz-no-1-ot-3-anvara-2025-g"><img class="logo" src="/src/assets/images/blago_year.jpg" alt="Год благоустройства" width="200" height="100"></a>
          </div>
          <div class="images-wrapper">
            <a href="#" style="pointer-events:none;"><img class="logo" src="/src/assets/images/80let.jpg" alt="80 лет" width="200" height="100"></a>
          </div>
        </div>
        
      </div>
      <div class="ft-copyright" v-if="layout && layout.copyright">
        <div class="ft-left">
          <p>{{ layout.copyright }}</p>
        </div>
        <div class="backtotop">
          <p><a href="#" id="back-to-top">Вверх  <i class="ion-ios-arrow-thin-up"></i></a></p>
        </div>
      </div>
    </div>
  </footer>
  <!-- end of footer v2 section-->
</template>

<style scoped>

</style>
