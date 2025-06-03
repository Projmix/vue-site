<template>
  <main>
    <headerSection />
    <!-- Banner -->
    <section class="inner-page-banner" :style="{ backgroundImage: 'url(' + bgBanner + ')' }">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="breadcrumbs-area">
              <h1>{{ event.name || 'Event Details' }}</h1>
              <ul>
                <li>
                  <router-link to="/">Главная</router-link>
                </li>
                <li>Событие</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Event Details -->
    <section class="section-space-less30">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="single-event-img">
              <img :src="event.image?.original || placeholderImg" class="img-fluid" alt="event" style="max-height: 400px; object-fit: cover;" />
            </div>
          </div>
          <div class="col-12">
            <div class="event-description">
              <h2 class="title title-bold color-dark">{{ event.name }}</h2>
              <p>{{ event.description || event.short_description || 'Описание события...' }}</p>
              <router-link :to="`/buy/${event.id}`" class="loadmore-four-item btn-fill border-radius-5 size-lg color-yellow margin-t-20">Купить билет</router-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Upcoming Events (заглушка) -->
      <div class="container">
        <h3 class="title-bold color-dark title-bar">Похожие события</h3>
        <div class="row">
          <div class="col-lg-4 col-md-12 col-sm-12" v-for="(rec, idx) in recommendations" :key="idx">
            <div class="profile-event">
              <h3 class="title title-bold color-dark">
                <router-link :to="`/event/${rec.id}`">{{ rec.name }}</router-link>
              </h3>
              <div class="profile-event-date">{{ rec.date }}</div>
              <div class="profile-event-place">{{ rec.place }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <footerSection />
  </main>
</template>

<script>
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import axios from 'axios';

export default {
  name: 'SinglEventView',
  components: { headerSection, footerSection },
  data() {
    return {
      event: {},
      recommendations: [],
      bgBanner: require('@/assets/images/figure/inner-page-figure.jpg'),
      placeholderImg: require('@/assets/images/about/about-logo.png'),
    };
  },
  async created() {
    const id = this.$route.params.id;
    // Пример запроса, заменить на реальный API
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v3/mobile/afisha/event/${id}`, { params: { lang: 'ru' } });
      this.event = res.data.data || {};
    } catch (e) {
      this.event = { name: 'Событие не найдено' };
    }
    // Заглушка похожих событий
    this.recommendations = [
      { id: 2, name: 'Digital marketing', date: '23 июля 2025, 10:00', place: 'CineHall_1' },
      { id: 3, name: 'Growth Hacking', date: '17 августа 2025, 10:00', place: 'CineHall_1' },
      { id: 4, name: 'Usability and Design', date: '29 сентября 2025, 10:00', place: 'CineHall_1' },
    ];
  },
};
</script>

<style scoped>
.single-event-img {
  margin-bottom: 30px;
  text-align: center;
}
.event-description {
  margin-bottom: 40px;
}
.profile-event {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  margin-bottom: 20px;
  min-height: 180px;
}
</style>
