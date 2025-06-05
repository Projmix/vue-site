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
    layoutLoaded: Promise
  },
  setup(props) {
    const layoutStore = useLayoutStore();
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);
    
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const perPage = ref(9);
    
    useHead({
      title: 'Новости',
      meta: [
        { name: 'description', content: 'Последние новости и информация' }
      ]
    });
    
    const getApiParams = () => ({
      lang: import.meta.env.VITE_API_LANG,
      jsonld: import.meta.env.VITE_API_JSONLD,
      cityId: import.meta.env.VITE_API_CITY_ID,
      onlyDomain: 1,
      domain: window.location.hostname,
      distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,
      expand: 'sessions',
      perPage: perPage.value,
      page: currentPage.value
    });
    
    const fetchPosts = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts`;
        const params = getApiParams();
        
        const response = await axios.get(apiUrl, { params });
        
        if (response.data) {
          posts.value = response.data.posts || [];
          totalPages.value = response.data.posts_last_page || 1;
        } else {
          posts.value = [];
          totalPages.value = 1;
          error.value = 'Данные не получены';
        }
      } catch (err) {
        error.value = `Ошибка загрузки новостей: ${err.message}`;
        posts.value = [];
        totalPages.value = 1;
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 300);
      }
    };
    
    const changePage = (page) => {
      currentPage.value = page;
      fetchPosts();
    };
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';

      const possibleFormats = [
        "YYYY-MM-DD HH:mm:ss",
        "DD.MM.YYYY HH:mm:ss",
        "YYYY-MM-DDTHH:mm:ssZ",
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        moment.ISO_8601,
        "YYYY-MM-DD",
        "DD.MM.YYYY"
      ];

      let momentDate = moment(dateStr, possibleFormats, true);

      if (!momentDate.isValid()) {
        momentDate = moment(dateStr);
      }

      if (momentDate.isValid()) {
        try {
          const date = momentDate.toDate();
          const formattedDate = new Intl.DateTimeFormat('ru-RU', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            era: undefined
          }).format(date);
          
          return formattedDate.replace(' г.', '');
        } catch (e) {
          return momentDate.locale('ru').format('DD MMMM YYYY'); 
        }
      }
      
      return dateStr;
    };
    
    onMounted(() => {
      props.layoutLoaded
        .then(() => fetchPosts())
        .catch(error => {
          fetchPosts();
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
    <div id="preloader" v-if="loading">
      <img class="logo" :src="logo2" alt="" width="119" height="58">
      <div id="status">
        <span></span>
        <span></span>
      </div>
    </div>

    <headerSection />
    
    <section class="section-space-equal">
      <div class="container">
        <div class="alert alert-danger" v-if="error">{{ error }}</div>
        
        <div class="row" id="no-equal-gallery" v-if="!loading && posts.length">
          <router-link 
            v-for="post in posts" 
            :key="post.id" 
            :to="`/post/${post.slug}`" 
            class="col-lg-4 col-md-6 col-sm-6 col-xs-12 no-equal-item news-card-link-wrapper"
          >
            <div class="blog-layout4">
              <div class="entry-image">
                <div class="item-image">
                    <img
                      :src="post.image['1600x900'] || post.image.original"
                      class="img-responsive"
                      :alt="post.title"
                      @error="$event.target.src = '/src/assets/images/blog/blog11.jpg'"
                    />
                </div>
                <div class="item-content">
                  <h3 class="title title-bold color-dark hover-primary">
                    {{ post.title }}
                  </h3>
                  <ul class="news-meta-info">
                    <li>{{ formatDate(post.publishedAt || post.published_at) }}</li>
                  </ul>
                  <p v-html="post.shortContent"></p>
                </div>
              </div>
            </div>
          </router-link>
        </div>
        
        <div v-else-if="!loading && !posts.length" class="text-center py-5">
          <p>Новостей пока нет.</p>
        </div>
        
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
  background-color: var(--theme-button-color);
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

.news-card-link-wrapper {
  text-decoration: none;
  display: flex;
  flex-direction: column;
}

.blog-layout4 {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
  display: flex; 
  flex-direction: column; 
  height: 100%;
}

.news-card-link-wrapper:hover .blog-layout4 {
  transform: scale(1.03);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.blog-layout4 .entry-image {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.img-responsive {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.blog-layout4 .item-content {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 6px 6px;
  background-color: #fff;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.blog-layout4 .item-content h3.title {
  margin-bottom: 10px;
  color: #333;
}

.blog-layout4 .item-content .news-meta-info {
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #757575;
  text-transform: capitalize;
}

.blog-layout4 .item-content p {
  font-size: 1em;
  line-height: 1.5;
  color: #555;
  flex-grow: 1;
}

.news-meta-info{
  font-size: 20px;
}
.section-space-equal{
  min-height: 50vh;
}
</style>
