<template>
  <main>
    <headerSection />
    <section class="inner-page-banner">
    </section>
    <section class="section-space-less30">
      <div class="container">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <div v-else class="row">
          <div class="col-lg-5 col-md-12 col-sm-12">
            <div class="single-speaker-img">
              <img :src="eventImage" class="img-fluid" alt="event-img" />
            </div>
          </div>
          <div class="col-lg-7 col-md-12 col-sm-12">
            <div class="speaker-profile">
              <h2 class="title title-black color-dark">{{ eventName }}</h2>
              <p v-html="eventDescription"></p>
            </div>
          </div>
        </div>
      </div>
      <div class="container mt-4" v-if="!loading && !error">
        <div class="row">
          <div class="col-12">
            <h3 class="title-medium mb-3">Доступные даты:</h3>
            <div class="profile-event-list row">
              <div class="col-lg-4 col-md-6 col-sm-12" v-for="(date, idx) in calendarDates" :key="idx">
                <div class="profile-event">
                  <div class="profile-event-date">{{ formatDate(date.date) }}</div>
                  <div v-if="date.sessions && date.sessions.length">
                    <div v-for="(session, sIndex) in date.sessions" :key="sIndex" class="session-item">
                      <div class="session-time mb-2">{{ formatTime(session.timeSpending) }}</div>
                      <button class="btn-fill size-xs color-yellow border-radius-5" 
                              @click="openBuyTicketPage(session.id)">
                        Купить билет (от {{ formatPrice(session.minPrice) }} руб.)
                      </button>
                    </div>
                  </div>
                  <div v-else class="text-center my-2">
                    <button class="btn-fill size-xs border-radius-5" 
                            @click="loadSessions(date)" 
                            :disabled="date.loading">
                      {{ date.loading ? 'Загрузка...' : 'Показать сеансы' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="calendarDates.length === 0" class="col-12 text-center">
                <p>Нет ближайших дат для этого события.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <footerSection />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import axios from 'axios';
import moment from 'moment';

const route = useRoute();
const eventId = route.params.id;
const loading = ref(true);
const error = ref('');
const eventName = ref('');
const eventDescription = ref('');
const eventImage = ref('');
const calendarDates = ref([]);

function formatDate(dateStr) {
  return moment(dateStr).format('DD MMMM YYYY');
}

function formatTime(timestamp) {
  return moment.unix(timestamp).format('HH:mm');
}

function formatPrice(price) {
  // Простой форматтер, можно заменить на более сложный при необходимости
  return (price / 100).toFixed(2);
}

async function loadSessions(date) {
  // Установка флага загрузки для конкретной даты
  date.loading = true;
  
  try {
    const timestamp = moment(date.date).unix();
    const params = {
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      time: timestamp,
      cityId: import.meta.env.VITE_API_CITY_ID,
    };
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v2/schedule/events/${eventId}`, 
      { params }
    );
    
    console.log('[loadSessions] response:', response.data);
    
    // Собираем все сессии из всех объектов
    const sessions = [];
    if (response.data.objects && Array.isArray(response.data.objects)) {
      response.data.objects.forEach(obj => {
        if (obj.sessions && Array.isArray(obj.sessions)) {
          // Добавляем информацию об объекте к каждой сессии
          const objSessions = obj.sessions.map(session => ({
            ...session,
            objectName: obj.name,
            objectAddress: obj.address
          }));
          sessions.push(...objSessions);
        }
      });
    }
    
    // Сортируем по времени
    date.sessions = sessions.sort((a, b) => a.timeSpending - b.timeSpending);
  } catch (e) {
    console.error('[loadSessions] Ошибка загрузки сеансов:', e);
    date.error = 'Не удалось загрузить сеансы';
    date.sessions = [];
  } finally {
    date.loading = false;
  }
}

function openBuyTicketPage(sessionId) {
  // Создаем URL для покупки билетов согласно стандарту API
  const ticketUrl = `https://saleframe.24afisha.by/?lang=${import.meta.env.VITE_API_LANG}&sid=${sessionId}&distributor_company_id=${import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID}`;
  
  // Открываем в новой вкладке
  window.open(ticketUrl, '_blank');
}

async function fetchEventData() {
  loading.value = true;
  error.value = '';
  
  try {
    // Формируем параметры запроса согласно стандарту API
    const params = {
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      time: Math.floor(Date.now() / 1000),
      cityId: import.meta.env.VITE_API_CITY_ID,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID
    };
    
    console.log('[SingleEventView] Запрос деталей события:', eventId, params);
    
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v3/arena/events/${eventId}`, { params });
    console.log('[SingleEventView] API response:', response.data);
    
    // Обрабатываем ответ согласно стандарту API
    const event = response.data;
    
    // Устанавливаем основные поля события
    eventName.value = event.name || event.performance?.name || 'Событие без названия';
    eventDescription.value = 
      event.description || 
      event.shortDescription || 
      event.performance?.description || 
      event.performance?.shortDescription || 
      'Описание отсутствует';
      
    // Устанавливаем изображение согласно стандарту API
    eventImage.value = 
      event.image?.['300x430'] || 
      event.performance?.image?.['300x430'] || 
      event.image?.original || 
      event.performance?.image?.original || 
      '/src/assets/images/speaker/speaker1.png';
    
    // Обрабатываем даты календаря
    if (event.calendar && Array.isArray(event.calendar)) {
      // Фильтрация - только будущие даты
      const now = moment().startOf('day');
      calendarDates.value = event.calendar
        .filter(dateObj => moment(dateObj.date).isSameOrAfter(now))
        .map(dateObj => ({
          ...dateObj,
          sessions: [], // Будет заполнено при клике на кнопку "Показать сеансы"
          loading: false,
          error: null
        }));
    }
    
    // Установка SEO данных
    useHead({
      title: `${eventName.value} | Афиша событий`,
      meta: [
        { name: 'description', content: eventDescription.value.slice(0, 160) }
      ]
    });
    
  } catch (e) {
    console.error('[SingleEventView] Ошибка загрузки события:', e);
    error.value = 'Не удалось загрузить информацию о событии';
    eventName.value = 'Событие не найдено';
    eventDescription.value = '';
    eventImage.value = '';
    calendarDates.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchEventData);
</script>

<style scoped>
.single-speaker-img img {
  width: 100%;
  border-radius: 10px;
}
.speaker-profile {
  margin-bottom: 2rem;
}
.profile-event {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.2rem 1rem;
  margin-bottom: 1.2rem;
  text-align: center;
}
.profile-event-date {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.profile-event-place {
  margin-top: 0.7rem;
}
.session-item {
  border-top: 1px solid #e5e5e5;
  padding-top: 10px;
  margin-top: 10px;
}
.session-time {
  font-weight: 500;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #fad03b;
}
</style>
