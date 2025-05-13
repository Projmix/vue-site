<template>
  <main>
    <HeaderSection />
    <section class="inner-page-banner"></section>
    <section class="single-blog-page">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div v-if="loading" class="text-center py-5">
              <span>Загрузка...</span>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center my-5">
              {{ error }}
            </div>
            <div v-else>
              <div class="item-image mb-4">
                <img v-if="post.image" :src="post.image" class="img-fluid width-100" alt="blog" />
              </div>
              <div class="title-bold color-dark size-sm mb-2">{{ post.title }}</div>
              <div class="news-meta-info mb-3">{{ post.publishedAt }}</div>
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
import { ref } from 'vue';
import { useRoute } from 'vue-router';
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
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/v3/arena/posts/${slug}?lang=ru&jsonld=0`);
    console.log('[SingleBlogView] API response:', data);
    const postData = data.posts;
    post.value = {
      title: postData?.title || '',
      publishedAt: postData?.publishedAt || '',
      image: postData?.image?.['800x450'] || '',
      content: postData?.content?.markdown || ''
    };
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

fetchPostData();
</script>

<style scoped>
.single-blog-page {
  padding: 40px 0;
}
.item-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
.title-bold.color-dark.size-sm {
  font-weight: bold;
  color: #222;
  font-size: 1.5rem;
}
.news-meta-info {
  color: #888;
  font-size: 1rem;
}
.single-blog-content-holder {
  margin-top: 20px;
}
</style>
