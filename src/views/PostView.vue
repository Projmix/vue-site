<script>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import moment from 'moment';
import ru from 'moment/locale/ru';
import NewsCard from '../components/NewsCard.vue'; // Предполагаемый компонент
import VueAwesomePaginate from "vue-awesome-paginate"; // Импортируем пагинацию
import "vue-awesome-paginate/dist/style.css"; // Стили пагинации
// import apiService from '@/services/apiService';

export default {
  name: "Posts",
  components: {
    headerSection,
    footerSection,
    NewsCard,
    VueAwesomePaginate, // Регистрируем компонент
  },
   props: {
      layoutLoaded: Promise // Пропс из App.vue
   },
  setup(props, { root }) { // Используем root, если setup не в <script setup>
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);

    useHead({
        title: 'Новости',
        meta: [
            { name: 'description', content: 'Последние новости и статьи' }
        ]
    });

    const loading = ref(true);
    const posts = ref([]);
    const currentPage = ref(1);
    const totalPages = ref(1); // Будет обновлено из API
    const perPage = ref(9); // Количество новостей на странице
    const selectedCityId = ref(import.meta.env.VITE_API_CITY_ID);

    // Переносим axios
    const axiosInstance = inject('$axios');

    const getCommonParams = (cityId = null) => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: cityId || selectedCityId.value,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
    });

    const fetchPosts = async (page = 1) => {
        loading.value = true;
        try {
             const params = {
               ...getCommonParams(),
               page: page,
               perPage: perPage.value,
             };
             const response = await axiosInstance.get(`/api/v3/arena/posts`, { params });
             posts.value = response.data.posts || [];
             // API возвращает posts_last_page, используем это как общее количество страниц
             totalPages.value = response.data.posts_last_page || 1;

        } catch (error) {
            console.error("Ошибка загрузки новостей:", error);
            posts.value = [];
            totalPages.value = 1;
        } finally {
            loading.value = false;
        }
    };

     const onPageChange = (newPage) => {
         currentPage.value = newPage;
         fetchPosts(currentPage.value);
     };

    onMounted(() => {
        props.layoutLoaded.then(() => {
            fetchPosts(currentPage.value);
        }).catch(error => {
            console.error("Ошибка ожидания layoutLoaded:", error);
            fetchPosts(currentPage.value);
        });
    });

    return {
      background,
      logo,
      logo2,
      loading,
      posts,
      currentPage,
      totalPages,
      onPageChange
    };
  },
  // Data, methods, computed, watch, beforeMount - перенесены в setup
};
</script>

<template>
  <main>
      <!--preloading-->
      <div id="preloader" v-if="loading">
          <img class="logo" :src="logo2" alt="Загрузка..." width="119" height="58">
          <div id="status">
              <span></span>
              <span></span>
          </div>
      </div>

      <headerSection />

      <!-- Banner -->
       <section class="inner-page-banner" :style="{ backgroundImage: 'url(' + background + ')' }">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="breadcrumbs-area">
                                <h1>Новости</h1>
                                <ul>
                                    <li><router-link to="/">Главная</router-link></li>
                                    <li>Новости</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
      </section>

      <!-- Posts Grid -->
      <section class="section-space-default bg-light">
          <div class="container">
              <div v-if="!loading">
                    <div v-if="posts.length" class="posts-view-grid">
                        <NewsCard v-for="post in posts" :key="post.id" :post="post" />
                    </div>
                    <p v-else>Новостей пока нет.</p>

                     <!-- Пагинация -->
                    <div class="pagination-container" v-if="totalPages > 1">
                        <vue-awesome-paginate
                            :total-items="totalPages * perPage"  
                            :items-per-page="perPage"
                            :max-pages-shown="5"
                            v-model="currentPage"
                            @click="onPageChange"
                            paginate-buttons-class="btn-paginate"
                            active-page-class="btn-paginate-active"
                            back-button-class="icon-prev"
                            next-button-class="icon-next"
                        />
                         <!-- Примечание: total-items здесь немного условно,
                              так как API дает только total pages.
                              Можно оставить просто :total-pages="totalPages",
                              если vue-awesome-paginate это поддерживает,
                              или передать items-per-page=1 и total-items=totalPages
                          -->
                    </div>
              </div>
              <div v-else>
                   <p>Загрузка новостей...</p>
              </div>
          </div>
      </section>

      <footerSection />

    </main>
</template>

<style>
/* Стили для PostsView */
.posts-view-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 колонки */
  gap: 25px;
  margin-bottom: 30px;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}

/* Стили для пагинации (уже были в оригинале, проверяем/дополняем) */
.btn-paginate {
    height: 40px;
    width: 40px;
    border: 1px solid #ddd; /* Добавляем границу для видимости */
    background-color: #fff;
    margin-inline: 5px;
    cursor: pointer;
    border-radius: 4px; /* Скругление */
    transition: background-color 0.3s ease, color 0.3s ease;
}
.btn-paginate:hover {
     background-color: #f0f0f0;
}

.btn-paginate-active {
    background-color: #dd003f; /* Основной цвет темы */
    color: white;
    border-color: #dd003f;
}
.btn-paginate-active:hover {
     background-color: #c70039; /* Чуть темнее при наведении */
}

/* Стили для стрелок (если используются классы icon-prev/icon-next) */
.icon-prev::before {
  content: '<'; /* Или иконка */
  /* Доп. стили для иконки */
}
.icon-next::before {
  content: '>'; /* Или иконка */
   /* Доп. стили для иконки */
}


/* Адаптация сетки */
@media (max-width: 991px) {
  .posts-view-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .posts-view-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Стили прелоадера (повторяются, лучше вынести) */
/* ... */
</style>