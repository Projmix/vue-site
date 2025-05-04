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
    // Флаг, чтобы не загружать скрипт повторно
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

    // Инициализация Google Translate с проверкой
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
    <div class="footer-layout2">
      <div class="footer-top-area footer-box-layout">
        <div class="container">
          <div class="row">
            <div class="col-lg-3">
              <div class="widget">
                <a class="footer-widget-logo" href="index.html">
                  <img class="img-fluid" src="../assets/images/logo.png" alt="logo">
                </a>
                <!--
               
                <div class="footer-widget-about">
                  <p>Fummy text of the printing antypesetting industry. Lorem Ipsum heen the industry's
                    standard dummy text ever since theype.</p>
                </div>
                <div class="footer-widget-contact">
                  <a href="tel:+5647-345-2224">5647-345-2224</a>
                </div>
                <div class="footer-widget-social">
                  <ul>
                    <li>
                      <a href="#" title="facebook">
                        <i class="fa fa-facebook" aria-hidden="true"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" title="twitter">
                        <i class="fa fa-twitter" aria-hidden="true"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" title="google-plus">
                        <i class="fa fa-google-plus" aria-hidden="true"></i>
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
                    <li>
                      <a href="#" title="rss">
                        <i class="fa fa-rss" aria-hidden="true"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              -->
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Раздел 1</h3>
                <div class="footer-widget-menu">
                  <ul>
                    <li>
                      <a href="#">Подраздел 1.1</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 1.2</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 1.3</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 1.4</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Раздел 2</h3>
                <div class="footer-widget-menu">
                  <ul>
                    <li>
                      <a href="#">Подраздел 2.1</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 2.2</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 2.3</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 2.4</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Раздел 3</h3>
                <div class="footer-widget-menu">
                  <ul>
                    <li>
                      <a href="#">Подраздел 3.1</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 3.2</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 3.3</a>
                    </li>
                    <li>
                      <a href="#">Подраздел 3.4</a>
                    </li>
                  </ul>
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
.footer-top-area .container-fluid .col-lg-3:first-child{
  display: flex;
  align-items: center;
}
.footer-layout2 .footer-top-area .widget .footer-widget-logo{
  margin-bottom: 0px;
}
</style>
