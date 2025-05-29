import { createApp } from 'vue'
import axios from 'axios'
import { createPinia } from 'pinia'
import moment from 'moment'
import 'moment/locale/ru'

import App from './App.vue'
import router from './router'
import apiService from './services/apiService'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@/assets/css/normalize.css';
import '@/assets/css/main.css';
import '@/assets/css/bootstrap.min.css';
import '@/assets/css/animate.min.css';
import '@/assets/css/font-awesome.min.css';
import '@/assets/css/meanmenu.min.css';
import '@/assets/css/magnific-popup.css';
import '@/assets/vendor/slider/css/nivo-slider.css';
import '@/assets/vendor/slider/css/preview.css';
import '@/assets/css/style.css';   

//import '@vuepic/vue-datepicker/dist/main.css'

import VueAwesomePaginate from "vue-awesome-paginate";
//import "vue-awesome-paginate/dist/style.css";

import { createHead } from '@vueuse/head';

import $ from 'jquery'
window.jQuery = $
window.$ = $

const axiosInstance = axios.create({
    withCredentials: false,
})

const head = createHead();

const app = createApp(App)

// Configure the router base URL if needed
if (import.meta.env.PROD) {
  // Make sure history API fallback works in production
  console.log('Running in production mode with base URL:', import.meta.env.BASE_URL || '/')
}

app.component('VueDatePicker', VueDatePicker)

// Регистрируем сервисы как глобальные свойства
app.config.globalProperties.$axios = { ...axiosInstance }
app.config.globalProperties.$api = apiService

// Создаем глобальный provide для apiService
app.provide('apiService', apiService)

app.use(VueAwesomePaginate)
app.use(createPinia())
app.use(router)
app.use(head)

// Set moment.js locale globally after import
moment.locale('ru')

app.mount('#app')
