<template>
  <main>
    <headerSection />

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
      
      <!-- Calendar dates selector - only if there are calendar dates -->
      <div class="container mt-4" v-if="!loading && !error && calendarDates.length > 0">
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

      <!-- Venues and sessions - only if there are calendar dates -->
      <div class="container mt-4" v-if="!loading && !error && calendarDates.length > 0">
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
                   @click="openPurchasePage(session)">
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

      <!-- Combined Services/Products section - if no calendar dates but offerings exist -->
      <div class="container mt-4" v-if="!loading && !error && calendarDates.length === 0 && offeringsList.length > 0">
          <h3 class="related-title">Услуга</h3>
          <div class="services-container venue-card"> 
            <div v-for="offering in offeringsList" :key="offering.id" class="service-item">
              <div class="service-info">
                <h4>{{ offering.name }}</h4>
                <p v-if="offering.relatedObjectName" class="object-name">{{ offering.relatedObjectName }}</p>
                <p v-if="offering.relatedObjectAddress" class="object-address">{{ offering.relatedObjectAddress }}</p>
                <!-- Conditionally display price only if not a product, or if it's a product AND you decide to show price for products -->
                <p v-if="offering.type !== 'product' && offering.priceDisplay" class="price">{{ offering.priceDisplay }}</p>
              </div>
              <button class="btn-fill size-xs color-yellow border-radius-5" @click="openPurchasePage(offering)">
                Купить
              </button>
            </div>
          </div>
        </div>

      <!-- Products section - if no calendar dates but products exist -->
      <div class="container mt-4" v-if="!loading && !error && calendarDates.length === 0 && offeringsList.length === 0">
        <h3 class="related-title">Услуга</h3>
        <div class="products-grid">
          <div v-for="offering in offeringsList" :key="offering.id" class="product-card">
            <img v-if="offering.image" :src="offering.image" :alt="offering.name" class="product-image"/>
            <div class="product-info">
              <h4>{{ offering.name }}</h4>
              <p v-if="offering.priceDisplay" class="price">{{ offering.priceDisplay }}</p>
            </div>
            <button class="btn-fill size-xs color-yellow border-radius-5" @click="openPurchasePage(offering)">
              Купить
            </button>
          </div>
        </div>
      </div>
      
      <!-- No data message -->
      <div class="container mt-4 text-center py-4" v-if="!loading && !error && calendarDates.length === 0 && offeringsList.length === 0">
        <p>Нет доступных сеансов, услуг или товаров для этого события.</p>
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
const eventImage = ref(''); // Default image if none found

const calendarDates = ref([]);
const selectedDateIndex = ref(0);
const selectedDate = computed(() => calendarDates.value[selectedDateIndex.value]?.date || null);
const loadingSelectedDate = ref(false);
const venuesList = ref([]);

const offeringsList = ref([]); // Unified list for services and products

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
  // Assuming price is in kopecks/cents
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
    if (response.data && Array.isArray(response.data) && response.data[0] && response.data[0].objects) {
      const objects = response.data[0].objects;
      if (Array.isArray(objects)) {
        venuesList.value = objects
          .filter(obj => obj.sessions && obj.sessions.length > 0)
          .map(obj => {
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
  } catch (e) {
    console.error('[loadSessions] Ошибка загрузки сеансов:', e);
    // Do not set global error here, it's specific to date loading
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
  const ticketUrl = apiService.getTicketUrl(sessionId);
  window.open(ticketUrl, '_blank');
}

// Combined purchase function
function openPurchasePage(offering) {
  if (offering.type === 'service') {
    const serviceUrl = apiService.getServicePurchaseUrl(offering.purchaseDetails.objectId, offering.id);
    window.open(serviceUrl, '_blank');
  } else if (offering.type === 'product') {
    const productUrl = apiService.getProductPurchaseUrl(offering.purchaseDetails.institutionId, offering.id);
    window.open(productUrl, '_blank');
  }
}

async function fetchEventData() {
  loading.value = true;
  error.value = '';
  calendarDates.value = [];
  venuesList.value = [];
  offeringsList.value = [];
  
  try {
    const event = await apiService.getEventDetails(eventId);
    
    eventName.value = event.name || event.performance?.name || 'Событие без названия';
    eventDescription.value = 
      event.description || 
      event.shortDescription || 
      event.performance?.description || 
      event.performance?.shortDescription || 
      'Описание отсутствует';
      
    let primaryImage = 
      event.image?.['300x430'] || 
      event.performance?.image?.['300x430'] || 
      event.image?.original || 
      event.performance?.image?.original;
    
    if (event.calendar && Array.isArray(event.calendar) && event.calendar.length > 0) {
    const now = moment().startOf('day');
      calendarDates.value = event.calendar
        .filter(dateObj => moment(dateObj.date).isSameOrAfter(now))
        .map(dateObj => ({ ...dateObj, date: dateObj.date }));
      
      if (calendarDates.value.length > 0) {
        selectedDateIndex.value = 0;
        await loadSessions(calendarDates.value[0].date);
      }
    } else {
      // No calendar dates, check for services (abonements) and products (items)
      
      // Process Services (Abonements)
      if (event.performance?.objectsWithActiveServices && Array.isArray(event.performance.objectsWithActiveServices)) {
        event.performance.objectsWithActiveServices.forEach(object => {
          if (object.activeAbonements && Array.isArray(object.activeAbonements)) {
            object.activeAbonements.forEach(abonement => {
              offeringsList.value.push({
                id: abonement.id,
                type: 'service',
                name: abonement.name || abonement.performance?.name || event.performance?.name || 'Услуга',
                price: abonement.minPrice, 
                priceDisplay: `от ${formatPrice(abonement.minPrice)} руб.`,
                relatedObjectName: object.name,
                relatedObjectAddress: object.address,
                purchaseDetails: { objectId: object.id }
              });
            });
          }
        });
      }

      // Process Products (Items)
      if (event.performance?.items && Array.isArray(event.performance.items)) {
        event.performance.items.forEach(item => {
          offeringsList.value.push({
            id: item.id,
            type: 'product',
            name: item.name || 'Товар',
            price: item.minPrice ? parseFloat(item.minPrice) * 100 : (item.price || 0), // Ensure price is in kopecks if minPrice is used
            priceDisplay: item.priceStr ? `${item.priceStr} руб.` : (item.minPrice ? `от ${item.minPrice} руб.` : 'Цена по запросу'),
            image: item.image?.['240x340'] || item.image?.original || null,
            relatedObjectName: item.institution?.name, // From item.institution
            relatedObjectAddress: item.institution?.address, // From item.institution
            purchaseDetails: { institutionId: item.institutionId }
          });
          // Fallback image logic
          if (!primaryImage && item.image?.['300x430']) {
            primaryImage = item.image['300x430'];
          } else if (!primaryImage && item.image?.original) {
            primaryImage = item.image.original;
          }
        });
      }
    }
    
    eventImage.value = primaryImage || '/src/assets/images/speaker/speaker1.png';

    useHead({
      title: `${eventName.value} | Афиша событий`,
      meta: [
        { name: 'description', content: eventDescription.value.slice(0, 160) }
      ]
    });
    
  } catch (e) {
    console.error('[fetchEventData] Ошибка загрузки события:', e);
    error.value = 'Не удалось загрузить информацию о событии';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchEventData);
</script>

<style scoped>
.single-speaker-img img {
  width: 100%;
  max-width: 400px; /* Max width for event image */
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem; /* Add some space below image */
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
  padding-bottom: 10px; /* For scrollbar */
}
.date-item {
  min-width: 60px;
  text-align: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0; /* Prevent shrinking */
}
.date-item:hover {
  border-color: var(--theme-button-color);
}
.date-item.active {
  border-color: var(--theme-button-color);
  background-color: var(--theme-button-color);
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
.venue-card { /* Also used for services-container */
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
  border-color: var(--theme-button-color);
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
.tag-3d, .tag-2d {
 position: relative;
}
.tag-3d::after, .tag-2d::after {
  content: "3D"; /* Default, can be overridden */
  background: var(--theme-button-color);
  color: #000;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  position: absolute;
  top: -8px; /* Adjust for better positioning */
  right: -8px; /* Adjust for better positioning */
}
.tag-2d::after {
  content: "2D";
  background: #9ce3ff;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
  color: var(--theme-text-color);
}

/* Styles for Services and Products */
.related-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 2rem; /* Space from previous content */
  color: #333;
  border-bottom: 2px solid #fad03b;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.services-container .service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.services-container .service-item:last-child {
  border-bottom: none;
}
.service-info h4 {
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
}
.service-info .object-name, .service-info .object-address {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.2rem;
}
.service-info .price {
  font-weight: bold;
  color: #111;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.product-info h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  min-height: 2.5em; /* For 2 lines of text */
}
.product-info .price {
  font-weight: bold;
  color: #111;
  margin-bottom: 1rem;
}
.product-card button {
  width: 100%;
}

</style>
