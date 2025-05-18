<template>
  <div class="speaker-layout3">
    <router-link :to="`/event/${event.id}`">
      <img :src="event.image['300x430'] || event.image['240x340'] || placeholderImage" :alt="event.name" class="img-fluid" />
    </router-link>
    <div class="item-title">
      <h3 class="title title-bold color-light hover-yellow size-md">
        <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
      </h3>
      <div class="title-light size-md text-left color-light" v-if="event.genre">{{ event.genre }}</div>
    </div>
    <div class="item-social" v-if="event.socials && event.socials.length">
      <ul>
        <li v-for="(social, idx) in event.socials" :key="idx">
          <a :href="social.url" :title="social.type" target="_blank" rel="noopener">
            <i :class="getSocialIconClass(social.type)"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import placeholder from '@/assets/images/speaker/speaker1.png'; // Запасное изображение
import moment from 'moment';

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      placeholderImage: placeholder // Используем импортированный плейсхолдер
    }
  },
  methods: {
    formatDate(timestamp, format = 'DD MMM') {
      return moment(timestamp).format(format);
    },
    getSocialIconClass(type) {
      // Преобразуем тип соцсети в класс FontAwesome
      switch ((type || '').toLowerCase()) {
        case 'facebook': return 'fa fa-facebook';
        case 'twitter': return 'fa fa-twitter';
        case 'linkedin': return 'fa fa-linkedin';
        case 'pinterest': return 'fa fa-pinterest';
        case 'instagram': return 'fa fa-instagram';
        case 'vk': return 'fa fa-vk';
        case 'youtube': return 'fa fa-youtube';
        default: return 'fa fa-globe';
      }
    }
  }
};
</script>

<style scoped>
.speaker-layout3 {
  position: relative;
  margin-bottom: 32px;
  background: linear-gradient(120deg, #232526 0%, #414345 100%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0,0,0,0.13);
  text-align: center;
  padding-bottom: 24px;
  transition: box-shadow 0.3s, transform 0.3s;
}
.speaker-layout3:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.19);
  transform: translateY(-6px) scale(1.03);
}
.speaker-layout3 .img-fluid {
  width: 100%;
  height: 485px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.speaker-layout3 .title {
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.speaker-layout3 .title a {
  color: #fff;
  text-decoration: none;
  transition: color 0.2s;
}
.speaker-layout3 .title a:hover {
  color: #fad03b;
}
.speaker-layout3 .title-light {
  font-size: 0.98rem;
  color: #fad03b;
  margin-bottom: 0;
  font-weight: 400;
}
.speaker-layout3 .item-social {
  margin-top: 18px;
}
.speaker-layout3 .item-social ul {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.speaker-layout3 .item-social li {
  display: inline-block;
}
.speaker-layout3 .item-social a {
  color: #fff;
  background: #fad03b;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.18rem;
  transition: background 0.2s, color 0.2s;
}
.speaker-layout3 .item-social a:hover {
  background: #fff;
  color: #fad03b;
}

@media (max-width: 991px) {
  .speaker-layout3 .img-fluid {
    height: 435px;
  }
}
@media (max-width: 767px) {
   .speaker-layout3 {
    max-width: 350px;
  } 
  .speaker-layout3 .img-fluid {
    height: 300px;
  }
  .speaker-layout3 .item-title {
   left:10px;
}
}

</style>