import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import axios from "axios"
export const useLayoutStore = defineStore("layout", {
    state: () => ({
        layout: null,
        //background: `url('/src/assets/images/${window.location.hostname}/ft-bg1.jpg')`,
        logo: `/src/assets/images/${window.location.hostname}/logo1.png`,
        logo2: `/src/assets/images/${window.location.hostname}/logo2.png`
    }),
    getters: {
      getLayout(state){
        return state.layout
      },
      getBackground(state){
        return state.background
      },
      getLogo(state){
        return state.logo
      },
      getLogo2(state){
        return state.logo2
      }
    },
    actions: {
      async fetchLayout() {
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/pages/layout`;
          const params = {
              lang: import.meta.env.VITE_API_LANG,
              jsonld: import.meta.env.VITE_API_JSONLD,
              onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
              domain: import.meta.env.VITE_API_DOMAIN,
              distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
          };
          const { data } = await axios.get(apiUrl, { params });
          this.layout = data;

          
        } catch (error) {
            console.log(error);
        }
      },

      async loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      },

      loadExternalScripts() {
        if (window._externalScriptsLoaded) return;
        window._externalScriptsLoaded = true;
        this.loadScript('/src/assets/js/jquery-2.2.4.min.js')
          .then(() => { console.log('Загружен: jquery-2.2.4.min.js'); return this.loadScript('/src/assets/js/plugins.js'); })
          .then(() => { console.log('Загружен: plugins.js'); return this.loadScript('/src/assets/js/popper.js'); })
          .then(() => { console.log('Загружен: popper.js'); return this.loadScript('/src/assets/js/bootstrap.min.js'); })
          .then(() => { console.log('Загружен: bootstrap.min.js'); return this.loadScript('/src/assets/vendor/slider/js/jquery.nivo.slider.js'); })
          .then(() => { console.log('Загружен: jquery.nivo.slider.js'); return this.loadScript('/src/assets/vendor/slider/home.js'); })
          .then(() => { console.log('Загружен: home.js'); return this.loadScript('/src/assets/js/jquery.meanmenu.min.js'); })
          .then(() => { console.log('Загружен: jquery.meanmenu.min.js'); return this.loadScript('/src/assets/js/jquery.scrollUp.min.js'); })
          .then(() => { console.log('Загружен: jquery.scrollUp.min.js'); 
          // return this.loadScript('/src/assets/js/jquery.counterup.min.js'); })
          // .then(() => { console.log('Загружен: jquery.counterup.min.js');
          // return this.loadScript('/src/assets/js/waypoints.min.js'); })
          // .then(() => { console.log('Загружен: waypoints.min.js');
          return this.loadScript('/src/assets/js/jquery.countdown.min.js'); })
          .then(() => { console.log('Загружен: jquery.countdown.min.js'); 
          //   return this.loadScript('/src/assets/js/isotope.pkgd.min.js'); })
          // .then(() => { console.log('Загружен: isotope.pkgd.min.js'); 
          // return this.loadScript('/src/assets/js/jquery.magnific-popup.min.js'); })
          // .then(() => { console.log('Загружен: jquery.magnific-popup.min.js'); 
          return this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBtmXSwv4YmAKtcZyyad9W7D4AC08z0Rb4'); })
          .then(() => { console.log('Загружен: maps.googleapis.com'); return this.loadScript('/src/assets/js/main.js'); })
          .then(() => { console.log('Загружен: main.js'); })
          .catch(error => console.error('Ошибка загрузки скриптов', error));
          

      }
    },
})
