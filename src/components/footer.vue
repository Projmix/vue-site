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

    // Режим для слабовидящих
    // const scriptLidrekon = document.createElement('script');
    // scriptLidrekon.type = 'text/javascript';
    // scriptLidrekon.src = 'https://lidrekon.ru/slep/js/uhpv-full.min.js';
    // document.head.appendChild(scriptLidrekon);

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
    <div class="footer-layout2">
      <div class="footer-top-area footer-box-layout">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-3">
              <div class="widget">
                <a class="footer-widget-logo" href="index.html">
                  <img class="img-fluid" src="../assets/images/logo.png" alt="logo">
                </a>
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
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Need Help</h3>
                <div class="footer-widget-menu">
                  <ul>
                    <li>
                      <a href="#">Online Chatting</a>
                    </li>
                    <li>
                      <a href="#">FAQ’s</a>
                    </li>
                    <li>
                      <a href="#">24/7 Client Support</a>
                    </li>
                    <li>
                      <a href="#">Others</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Useful Links</h3>
                <div class="footer-widget-menu">
                  <ul>
                    <li>
                      <a href="#">Home</a>
                    </li>
                    <li>
                      <a href="#">About Us</a>
                    </li>
                    <li>
                      <a href="#">Help</a>
                    </li>
                    <li>
                      <a href="#">Terms &amp; Privecy</a>
                    </li>
                    <li>
                      <a href="#">Support</a>
                    </li>
                    <li>
                      <a href="#">Payment Policy</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-lg-3">
              <div class="widget">
                <h3 class="widgettitle">Newsletter</h3>
                <div class="footer-widget-newsletter">
                  <p>Rimply dummy text the printing and typesetting in sum has been the industry's
                    standar.</p>
                  <div class="input-group stylish-input-group">
                    <input type="email" placeholder="E-mail address" name="email" class="form-control" required="">
                    <span class="input-group-addon">
                      <button type="submit">
                        <i class="fa fa-angle-right" aria-hidden="true"></i>
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom-area footer-box-layout">
        <p>© 2018 eventalk. All Rights Reserved. Designed by
          <a target="_blank" href="https://radiustheme.com">
            RadiusTheme</a>
        </p>
      </div>
    </div>
  </footer>
  <!-- end of footer v2 section-->
</template>

<style scoped></style>
