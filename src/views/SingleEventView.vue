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
      
      <!-- Calendar dates selector -->
      <div class="container mt-4" v-if="!loading && !error">
        <div class="date-selector">
          <div class="date-selector-inner">
            <div 
              v-for="(date, idx) in calendarDates" 
              :key="idx" 
              class="date-item" 
              :class="{ active: selectedDateIndex === idx }"
              @click="selectDate(idx)">
              <div class="date-day">{{ formatDateShort(date.date, 'DD') }}</div>
              <div class="date-weekday">{{ formatDateShort(date.date, 'dd') }}</div>
              <div class="date-month">{{ formatDateShort(date.date, 'MMM') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Venues and sessions -->
      <div class="container mt-4" v-if="!loading && !error">
        <div v-if="loadingSelectedDate" class="text-center py-3">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading sessions...</span>
                </div>
              </div>
        <div v-else-if="venuesList.length" class="venues-container">
          <div v-for="venue in venuesList" :key="venue.id" class="venue-card">
            <h3 class="venue-name">{{ venue.name }}</h3>
            <p class="venue-address">{{ venue.address }}</p>
            <div class="sessions-container">
              <div v-for="session in venue.sessions" :key="session.id" 
                   class="session-time-btn" 
                   :class="{'tag-3d': hasTag(session, '3D'), 'tag-2d': hasTag(session, '2D')}"
                   @click="openBuyTicketPage(session.id)">
                <span class="time">{{ formatTime(session.timeSpending) }}</span>
                <span class="price">от {{ formatPrice(session.minPrice) }} руб.</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedDate" class="text-center py-4">
          <p>Нет сеансов на выбранную дату.</p>
        </div>
        <div v-else class="text-center py-4">
          <p>Нет доступных сеансов для этого события.</p>
        </div>
      </div>
    </section>
    <footerSection />
  </main>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import moment from 'moment';
import 'moment/locale/ru';

const route = useRoute();
const eventId = route.params.id;
const loading = ref(true);
const error = ref('');
const eventName = ref('');
const eventDescription = ref('');
const eventImage = ref('');
const calendarDates = ref([]);
const selectedDateIndex = ref(0);
const selectedDate = computed(() => calendarDates.value[selectedDateIndex.value]?.date || null);
const loadingSelectedDate = ref(false);
const venuesList = ref([]);

// Inject apiService
const apiService = inject('apiService');

// Set moment to Russian locale
moment.locale('ru');

function formatDate(dateStr) {
  return moment(dateStr).format('DD MMMM YYYY');
}

function formatDateShort(dateStr, format) {
  return moment(dateStr).format(format);
}

function formatTime(timestamp) {
  return moment.unix(timestamp).format('HH:mm');
}

function formatPrice(price) {
  return (price / 100).toFixed(2);
}

function hasTag(session, tagName) {
  if (!session.tags || !Array.isArray(session.tags)) return false;
  return session.tags.some(tag => tag.name === tagName);
}

async function loadSessions(date) {
  if (!date) return;
  
  loadingSelectedDate.value = true;
  venuesList.value = [];
  
  try {
    const response = await apiService.getEventSessions(eventId, date);
    
    console.log('[loadSessions] Raw API response:', response);
    
    // Check if the response has the expected data structure
    if (response.data && Array.isArray(response.data) && response.data[0] && response.data[0].objects) {
      // Access the objects inside the first item in data array
      const objects = response.data[0].objects;
      
      if (Array.isArray(objects)) {
        // Transform data to venue list with sessions
        venuesList.value = objects
          .filter(obj => obj.sessions && obj.sessions.length > 0)
          .map(obj => {
            // Sort sessions by time
            const sortedSessions = [...obj.sessions].sort((a, b) => a.timeSpending - b.timeSpending);
            
            return {
              id: obj.id,
              name: obj.name,
              address: obj.address,
              sessions: sortedSessions
            };
          });
      }
    }
    
    console.log('[loadSessions] Venues with sessions:', venuesList.value);
  } catch (e) {
    console.error('[loadSessions] Ошибка загрузки сеансов:', e);
    error.value = 'Не удалось загрузить информацию о сеансах';
  } finally {
    loadingSelectedDate.value = false;
  }
}

function selectDate(index) {
  if (selectedDateIndex.value === index) return;
  selectedDateIndex.value = index;
  loadSessions(calendarDates.value[index].date);
}

function openBuyTicketPage(sessionId) {
  // Use apiService to generate the ticket URL
  const ticketUrl = apiService.getTicketUrl(sessionId);
  window.open(ticketUrl, '_blank');
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
          date: dateObj.date
        }));
      
      // If we have dates, automatically load sessions for the first date
      if (calendarDates.value.length > 0) {
        selectedDateIndex.value = 0;
        loadSessions(calendarDates.value[0].date);
      }
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

/* Date selector styles */
.date-selector {
  margin-bottom: 2rem;
  overflow-x: auto;
}
.date-selector-inner {
  display: flex;
  gap: 10px;
  padding-bottom: 10px;
}
.date-item {
  min-width: 60px;
  text-align: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.date-item:hover {
  border-color: #fad03b;
}
.date-item.active {
  border-color: #fad03b;
  background-color: #fad03b;
  color: #000;
}
.date-day {
  font-size: 1.5rem;
  font-weight: bold;
}
.date-weekday {
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-top: -5px;
}
.date-month {
  font-size: 0.9rem;
  margin-top: -3px;
}

/* Venues styles */
.venues-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.venue-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.5rem;
}
.venue-name {
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1.2rem;
}
.venue-address {
  color: #666;
  margin-bottom: 1.2rem;
  font-size: 0.95rem;
}
.sessions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.session-time-btn {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  min-width: 85px;
  text-align: center;
}
.session-time-btn:hover {
  border-color: #fad03b;
  transform: translateY(-2px);
}
.session-time-btn .time {
  font-weight: 600;
  font-size: 1.1rem;
}
.session-time-btn .price {
  font-size: 0.8rem;
  color: #666;
}
.tag-3d {
  border-left: 4px solid #fad03b;
}
.tag-3d::after {
  content: "3D";
  background: #fad03b;
  color: #000;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  position: absolute;
  margin-top: -20px;
  margin-left: 5px;
}
.tag-2d {
  border-left: 4px solid #9ce3ff;
}
.tag-2d::after {
  content: "2D";
  background: #9ce3ff;
  color: #000;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  position: absolute;
  margin-top: -20px;
  margin-left: 5px;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #fad03b;
}
</style>
