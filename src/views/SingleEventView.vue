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
                    <button class="btn-fill size-xs color-yellow border-radius-5" 
                            @click="buyTicketForDate(date)" 
                            :disabled="date.loading">
                      {{ date.loading ? 'Загрузка...' : 'Купить' }}
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
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import moment from 'moment';

const route = useRoute();
const eventId = route.params.id;
const loading = ref(true);
const error = ref('');
const eventName = ref('');
const eventDescription = ref('');
const eventImage = ref('');
const calendarDates = ref([]);

// Inject apiService
const apiService = inject('apiService');

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
  if (date.sessions && date.sessions.length) {
    // Sessions already loaded, no need to reload
    return;
  }
  
  date.loading = true;
  
  try {
    // Use apiService instead of direct axios call
    const sessions = await apiService.getEventSessions(eventId, date.date);
    date.sessions = sessions;
    console.log('[loadSessions] Loaded sessions:', sessions);
  } catch (e) {
    console.error('[loadSessions] Ошибка загрузки сеансов:', e);
    date.error = 'Не удалось загрузить сеансы';
    date.sessions = [];
  } finally {
    date.loading = false;
  }
}

function openBuyTicketPage(sessionId) {
  // Use apiService to generate the ticket URL
  const ticketUrl = apiService.getTicketUrl(sessionId);
  window.open(ticketUrl, '_blank');
}

// We can directly buy a ticket for the first session if date clicked
async function buyTicketForDate(date) {
  if (date.sessions && date.sessions.length > 0) {
    // If sessions already loaded, use the first session
    openBuyTicketPage(date.sessions[0].id);
  } else {
    // If sessions not loaded yet, load them first
    date.loading = true;
    try {
      const sessions = await apiService.getEventSessions(eventId, date.date);
      date.sessions = sessions;
      if (sessions.length > 0) {
        openBuyTicketPage(sessions[0].id);
      } else {
        console.error('[buyTicketForDate] No sessions available');
      }
    } catch (e) {
      console.error('[buyTicketForDate] Error:', e);
    } finally {
      date.loading = false;
    }
  }
}

async function fetchEventData() {
  loading.value = true;
  error.value = '';
  
  try {
    // Use apiService instead of direct axios call
    const event = await apiService.getEventDetails(eventId);
    
    // Set basic event details
    eventName.value = event.name || event.performance?.name || 'Событие без названия';
    eventDescription.value = 
      event.description || 
      event.shortDescription || 
      event.performance?.description || 
      event.performance?.shortDescription || 
      'Описание отсутствует';
      
    // Set event image
    eventImage.value = 
      event.image?.['300x430'] || 
      event.performance?.image?.['300x430'] || 
      event.image?.original || 
      event.performance?.image?.original || 
      '/src/assets/images/speaker/speaker1.png';
    
    // Process calendar dates
    if (event.calendar && Array.isArray(event.calendar)) {
      const now = moment().startOf('day');
      calendarDates.value = event.calendar
        .filter(dateObj => moment(dateObj.date).isSameOrAfter(now))
        .map(dateObj => ({
          ...dateObj,
          sessions: [], // Will be populated on demand
          loading: false,
          error: null
        }));
    }
    
    // Set SEO data
    useHead({
      title: `${eventName.value} | Афиша событий`,
      meta: [
        { name: 'description', content: eventDescription.value.slice(0, 160) }
      ]
    });
    
  } catch (e) {
    console.error('[fetchEventData] Ошибка загрузки события:', e);
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
