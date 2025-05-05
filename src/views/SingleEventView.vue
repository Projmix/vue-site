<template>
  <main>
    <headerSection />
    <section class="inner-page-banner">
    </section>
    <section class="section-space-less30">
      <div class="container">
        <div class="row">
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
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="profile-event-list row">
              <div class="col-lg-4 col-md-6 col-sm-12" v-for="(date, idx) in upcomingDates" :key="idx">
                <div class="profile-event">
                  <div class="profile-event-date">{{ formatDate(date) }}</div> <!--как строка, так и объект -->
                  <button class="btn-fill size-xs color-yellow border-radius-5" @click="buyTicket(date)">Купить билет</button>
                </div>
              </div>
              <div v-if="upcomingDates.length === 0" class="col-12 text-center">
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
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import axios from 'axios';
import moment from 'moment';

const route = useRoute();
const eventId = route.params.id;
const eventName = ref('');
const eventDescription = ref('');
const eventImage = ref('');
const upcomingDates = ref([]);

function formatDate(date) {
  // Поддержка как строки, так и объекта с полем date
  const dateStr = (typeof date === 'object' && date !== null && date.date) ? date.date : date;
  return moment(dateStr).format('DD MMM YYYY, HH:mm');
}

function buyTicket(date) {
  // Здесь должен быть вызов виджета или переход на покупку
  alert('Покупка билета на ' + formatDate(date));
}

async function fetchEventData() {
  try {
    console.log('[SingleEventView] eventId:', eventId);
    const eventResp = await axios.get(`${import.meta.env.VITE_API_URL}/api/v3/arena/events/${eventId}`);
    console.log('[SingleEventView] API response:', eventResp);
    const ev = eventResp.data;
    console.log('[SingleEventView] ev:', ev);
    // Новый формат: performance, calendar
    console.log('[SingleEventView] ev.performance:', ev.performance);
    eventName.value = ev.performance?.name || 'Событие';
    eventDescription.value = ev.performance?.description || ev.performance?.shortDescription || '';
    eventImage.value = ev.performance?.image?.original || '';
    console.log('[SingleEventView] eventName:', eventName.value);
    console.log('[SingleEventView] eventDescription:', eventDescription.value);
    console.log('[SingleEventView] eventImage:', eventImage.value);
    // Фильтрация дат: только будущие (или сегодняшние), максимум 3
    const now = moment().startOf('day');
    console.log('[SingleEventView] now:', now.format('YYYY-MM-DD'));
    if (Array.isArray(ev.calendar)) {
      console.log('[SingleEventView] ev.calendar:', ev.calendar);
      const filteredDates = ev.calendar.filter(dateObj => moment(dateObj.date, 'YYYY-MM-DD').isSameOrAfter(now));
      console.log('[SingleEventView] filteredDates:', filteredDates);
      upcomingDates.value = filteredDates.slice(0, 3);
      console.log('[SingleEventView] upcomingDates:', upcomingDates.value);
    } else {
      console.warn('[SingleEventView] ev.calendar is not an array:', ev.calendar);
      upcomingDates.value = [];
    }
  } catch (e) {
    eventName.value = 'Событие не найдено';
    eventDescription.value = '';
    eventImage.value = '';
    upcomingDates.value = [];
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
}
.profile-event-place {
  margin-top: 0.7rem;
}
</style>
