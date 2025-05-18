<script>
import { onMounted, ref, computed } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useHead } from '@vueuse/head';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';

export default {
  name: "Posts",
  components: {
    headerSection,
    footerSection
  },
  props: {
    layoutLoaded: Promise // Пропс из App.vue
  },
  setup(props) {
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);
    
    // Состояние для новостей
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const perPage = ref(9); // 9 новостей на странице согласно стандарту API
    
    // SEO
    useHead({
      title: 'Новости',
      meta: [
        { name: 'description', content: 'Последние новости и информация' }
      ]
    });
    
    // Получение общих параметров запросов API
    const getApiParams = () => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: import.meta.env.VITE_API_CITY_ID,
      onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
      domain: import.meta.env.VITE_API_DOMAIN,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
      expand: 'sessions',
      perPage: perPage.value,
      page: currentPage.value
    });
    
    // Функция загрузки новостей
    const fetchPosts = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts`;
        const params = getApiParams();
        
        console.log('[PostsView] Запрос новостей:', params);
        const response = await axios.get(apiUrl, { params });
        console.log('[PostsView] Ответ API:', response.data);
        
        if (response.data) {
          posts.value = response.data.posts || [];
          totalPages.value = response.data.posts_last_page || 1;
        } else {
          posts.value = [];
          totalPages.value = 1;
          error.value = 'Данные не получены';
        }
      } catch (err) {
        console.error('[PostsView] Ошибка загрузки новостей:', err);
        error.value = `Ошибка загрузки новостей: ${err.message}`;
        posts.value = [];
        totalPages.value = 1;
      } finally {
        // Небольшая задержка для UX
        setTimeout(() => {
          loading.value = false;
        }, 300);
      }
    };
    
    // Обработчик изменения страницы
    const changePage = (page) => {
      currentPage.value = page;
      fetchPosts();
    };
    
    // Форматирование даты
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      
      // Поддержка разных форматов даты
      if (moment(dateStr, 'DD.MM.YYYY', true).isValid()) {
        return moment(dateStr, 'DD.MM.YYYY').format('DD MMMM YYYY');
      } else if (moment(dateStr).isValid()) {
        return moment(dateStr).format('DD MMMM YYYY');
      }
      return dateStr;
    };
    
    // Загрузка данных после монтирования
    onMounted(() => {
      props.layoutLoaded
        .then(() => fetchPosts())
        .catch(error => {
          console.error("[PostsView] Ошибка ожидания layoutLoaded:", error);
          fetchPosts(); // Пытаемся загрузить в любом случае
        });
    });

    return {
      background,
      logo,
      logo2,
      layoutStore,
      posts,
      loading,
      error,
      currentPage,
      totalPages,
      changePage,
      formatDate
    };
  }
};
</script>

<template>
  <main>
    <!--preloading-->
    <div id="preloader" v-if="loading">
      <img class="logo" :src="logo2" alt="" width="119" height="58">
      <div id="status">
        <span></span>
        <span></span>
      </div>
    </div>

    <headerSection />

    <!-- Banner and Breadcrumbs -->
    <section class="inner-page-banner" :style="{ backgroundImage: 'url(' + background + ')' }">
      
    </section>
    
    <!-- Posts Section -->
    <section class="section-space-equal">
      <div class="container">
        <!-- Сообщение об ошибке -->
        <div class="alert alert-danger" v-if="error">{{ error }}</div>
        
        <!-- Посты -->
        <div class="row" id="no-equal-gallery" v-if="!loading && posts.length">
          <div
            class="col-lg-4 col-md-6 col-sm-6 col-xs-12 no-equal-item"
            v-for="post in posts"
            :key="post.id"
          >
            <div class="blog-layout4">
              <div class="entry-image">
                <div class="item-image">
                  <router-link :to="`/post/${post.slug}`">
                    <img
                      :src="post.image['1300x560'] || post.image['1600x900'] || post.image.original"
                      class="img-responsive"
                      :alt="post.title"
                      @error="$event.target.src = '/src/assets/images/blog/blog11.jpg'"
                    />
                  </router-link>
                </div>
                <div class="item-content">
                  <h3 class="title title-bold color-dark hover-primary">
                    <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
                  </h3>
                  <ul class="news-meta-info">
                    <li>{{ formatDate(post.publishedAt || post.published_at) }}</li>
                  </ul>
                  <p v-html="post.shortContent"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Сообщение если новостей нет -->
        <div v-else-if="!loading && !posts.length" class="text-center py-5">
          <p>Новостей пока нет.</p>
        </div>
        
        <!-- Пагинация -->
        <div class="pagination-container" v-if="!loading && totalPages > 1">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" 
                      class="btn-paginate">
                &laquo;
              </button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page">
              <button @click="changePage(page)" 
                     :class="['btn-paginate', { 'btn-paginate-active': page === currentPage }]">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" 
                      class="btn-paginate">
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
    
    <footerSection />
  </main>
</template>

<style>
@import "../assets/css/style.css";

.btn-paginate {
  height: 40px;
  width: 40px;
  border: none;
  margin-inline: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.btn-paginate-active {
  background-color: #fad03b;
  color: #111;
  font-weight: bold;
}

.btn-paginate:hover:not(.btn-paginate-active) {
  background-color: #eee;
}

.btn-paginate:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
}

.page-item {
  margin: 0 5px;
}

.img-responsive {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 6px 6px 0 0;
}
</style>
