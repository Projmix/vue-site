<template>
  <main>
    <HeaderSection />
    <section class="inner-page-banner"></section>
    <section class="single-blog-page">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center my-5">
              {{ error }}
            </div>
            <div v-else>
              <div class="item-image mb-4">
                <img v-if="post.image" :src="post.image" class="img-fluid width-100" alt="blog" />
              </div>
              <div class="post-meta mb-3">
                <span class="post-date">{{ post.publishedAt }}</span>
              </div>
              <h1 class="post-title title-bold color-dark mb-4">{{ post.title }}</h1>
              <div class="single-blog-content-holder" v-html="post.content"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <FooterSection />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import HeaderSection from '../components/header.vue';
import FooterSection from '../components/footer.vue';
import axios from 'axios';

const route = useRoute();
const post = ref({
  title: '',
  publishedAt: '',
  image: '',
  content: ''
});
const loading = ref(true);
const error = ref('');

async function fetchPostData() {
  loading.value = true;
  error.value = '';
  const slug = route.params.slug;
  console.log('[SingleBlogView] slug:', slug);
  
  // Формируем параметры запроса в соответствии с API стандартом
  const params = {
    lang: import.meta.env.VITE_API_LANG,
    jsonld: import.meta.env.VITE_API_JSONLD,
    cityId: import.meta.env.VITE_API_CITY_ID,
    onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
    domain: import.meta.env.VITE_API_DOMAIN,
    distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID
  };
  
  try {
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/arena/posts/${slug}`;
    const { data } = await axios.get(apiUrl, { params });
    console.log('[SingleBlogView] API response:', data);
    
    const postData = data.posts;
    
    // Интерсуемся правильными полями в соответствии с API
    post.value = {
      title: postData?.title || '',
      publishedAt: postData?.publishedAt || postData?.published_at || '',
      // Выбираем наилучшее доступное изображение
      image: postData?.image?.['800x450'] || 
             postData?.image?.['1300x560'] || 
             postData?.image?.original || '',
      // Выбираем контент, предпочтительно markdown или HTML
      content: postData?.content?.markdown || 
               postData?.content?.html || 
               postData?.content || ''
    };
    
    // Устанавливаем SEO данные
    useHead({
      title: post.value.title || 'Новость',
      meta: [
        { name: 'description', content: postData?.description || postData?.shortContent || post.value.title || '' }
      ]
    });
    
    console.log('[SingleBlogView] post.value:', post.value);
  } catch (e) {
    console.error('[SingleBlogView] error:', e);
    error.value = 'Новость не найдена или произошла ошибка при загрузке.';
    post.value = { title: '', publishedAt: '', image: '', content: '' };
  } finally {
    loading.value = false;
    console.log('[SingleBlogView] loading:', loading.value, 'error:', error.value);
  }
}

onMounted(fetchPostData);
</script>

<style scoped>
.single-blog-page {
  padding: 40px 0;
}
.item-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
}
.post-title {
  font-size: 2rem;
  line-height: 1.3;
}
.post-meta {
  color: #888;
  font-size: 1rem;
}
.post-date {
  font-weight: 500;
}
.single-blog-content-holder {
  margin-top: 20px;
  line-height: 1.7;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #fad03b;
}
</style>
