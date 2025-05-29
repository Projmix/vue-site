<template>
  <router-link :to="{ name: 'news-single', params: { slug: post.slug } }" class="news-card-link">
  <div class="blog-layout3 overlay-gradient news-aspect">
    <div class="image-wrapper news-img-aspect">
      <img
        :src="post.image['250x170'] || placeholderImage"
        :alt="post.title"
        class="img-fluid news-img-crop"
        @error="onImgError"
      >
      <div class="item-date-wrap" style="position: absolute; top: 10px; left: 15px; z-index: 2;">
        <div class="item-date">
          {{ getNewsDay(post) }}
        </div>
      </div>
    </div>
    <div class="item-content news-title-only">
      <div class="item-title">
        <h3 class="title-medium color-light hover-yellow">
          {{ post.title }}
        </h3>
      </div>
    </div>
  </div>
  </router-link>
</template>
  
  <script>
  import placeholder from '@/assets/images/blog/blog11.jpg'; // Запасное изображение для новостей
  import moment from 'moment';
  
  export default {
    name: 'NewsCard',
    props: {
      post: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        placeholderImage: placeholder
      }
    },
    methods: {
      onImgError(event) {
        event.target.src = this.placeholderImage;
      },
      getNewsDay(post) {
        const dateStr = post.published_at || post.publishedAt || '';
        const currentLocale = moment.locale(); // Сохраняем текущую локаль
        moment.locale('ru'); // Устанавливаем русскую локаль
        let formattedDate = '';

        if (moment(dateStr, 'DD.MM.YYYY HH:mm:ss', true).isValid()) {
          formattedDate = moment(dateStr, 'DD.MM.YYYY HH:mm:ss').format('DD MMM');
        } else if (moment(dateStr, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
          formattedDate = moment(dateStr, 'YYYY-MM-DD HH:mm:ss').format('DD MMM');
        } else if (moment(dateStr, 'DD.MM.YYYY', true).isValid()) {
          formattedDate = moment(dateStr, 'DD.MM.YYYY').format('DD MMM');
        } else if (moment(dateStr).isValid()) { // Общий случай, если другие форматы не подошли
          formattedDate = moment(dateStr).format('DD MMM');
        }
        moment.locale(currentLocale); // Восстанавливаем исходную локаль
        return formattedDate;
      },
      formatDate(dateString, format = 'DD MMM YYYY') {
        const currentLocale = moment.locale(); // Сохраняем текущую локаль
        moment.locale('ru'); // Устанавливаем русскую локаль
        let formattedDate = dateString; // По умолчанию возвращаем исходную строку

        // Пробуем разные форматы исходной даты
        if (moment(dateString, 'DD.MM.YYYY HH:mm:ss', true).isValid()) {
          formattedDate = moment(dateString, 'DD.MM.YYYY HH:mm:ss').format(format);
        } else if (moment(dateString, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
          formattedDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss').format(format);
        } else if (moment(dateString, 'DD.MM.YYYY', true).isValid()) {
          formattedDate = moment(dateString, 'DD.MM.YYYY').format(format);
        } else if (moment(dateString).isValid()) { // Общий случай
          formattedDate = moment(dateString).format(format);
        }

        moment.locale(currentLocale); // Восстанавливаем исходную локаль
        return formattedDate;
      }
    },
  };
</script>
  
  <style scoped>
.news-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.blog-layout3 {
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

.news-img-aspect {
  aspect-ratio: 1.5/1;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: #181818;
}
@supports not (aspect-ratio: 1.5/1) {
  .news-img-aspect {
    width: 100%;
    padding-top: 66.6667%;
    height: 0;
    position: relative;
  }
}
.news-img-crop {
  position: absolute;
  top: 0; left: 0; width: 100%;
  object-fit: cover;
  display: block;
}

.blog-layout3 img {
  -webkit-transform: scale(1);
  -moz-transform: scale(1);
  -ms-transform: scale(1);
  -o-transform: scale(1);
  transform: scale(1);
  -webkit-transition: all 0.5s ease-out;
  -moz-transition: all 0.5s ease-out;
  -ms-transition: all 0.5s ease-out;
  -o-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}
.blog-layout3 .item-date-wrap {
  position: absolute;
  left: 30px;
  top: 30px;
  z-index: 1;
}
@media only screen and (max-width: 767px) {
  .blog-layout3 .item-date-wrap {
    top: 10px;
    left: 10px;
  }
}
.blog-layout3 .item-date-wrap .item-date {
  text-align: center;
  padding: 8px 20px 7px;
  background-color: #fad03b;
  color: #111111;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 900;
  position: relative;
  -webkit-transition: all 0.5s ease-out;
  -moz-transition: all 0.5s ease-out;
  -ms-transition: all 0.5s ease-out;
  -o-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}
.blog-layout3 .item-date-wrap .item-date:before {
  content: "";
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  background-color: #d5ae26;
  top: 5px;
  left: 5px;
  -webkit-transition: all 0.5s ease-out;
  -moz-transition: all 0.5s ease-out;
  -ms-transition: all 0.5s ease-out;
  -o-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}
.blog-layout3 .item-date-wrap .item-date span {
  display: block;
  font-size: 18px;
  font-weight: 500;
}
.blog-layout3 .item-content {
  padding: 0 12px;
  position: absolute;
  bottom: 5px;
  left: 15px;
  text-align: left;
  z-index: 3;
}
@media only screen and (max-width: 767px) {
  .blog-layout3 .item-content {
    bottom: 0;
    left: 0;
  }
}
.blog-layout3 .item-content .item-deccription {
  color: #ffffff;
}
.blog-layout3 .item-content .item-title h3 {
  margin-bottom: 10px;
}
.blog-layout3:hover img {
  transform: scale(1.1);
}
.blog-layout3:hover .item-date:before {
  top: -5px;
  left: -5px;
}
</style>