<template>
  <headerSection />
            <!-- Inne Page Banner Area End Here -->
            <!-- Sponsonrs Area Start Here -->
            <section class="section-space-default bg-light">
                <div class="container">
                    <div class="section-heading title-black color-dark text-center">
                        <h2>Offcial Sponsonrs &amp; Partner</h2>
                        <p>Check Who Makes This Event Possible!</p>
                    </div>
                    <div class="sponsonrs-layout1">
                        <div class="row">
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor1" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor2" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor3" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor4" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor5" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor6" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor7" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-3 col-sm-6 col-12">
                                <div class="sponsonrs-box">
                                    <a href="#">
                                        <img :src="sponsor8" alt="brand" class="img-fluid">
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 text-center">
                            <a href="#" title="Become a Sponsors" class="btn-fill size-lg color-yellow border-radius-5 margin-t-30">Become a Sponsors</a>
                        </div>
                    </div>
                </div>
            </section>
  <footerSection />
</template>

<script setup>
import { ref } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import sponsor1 from '@/assets/images/brand/brand1.png';
import sponsor2 from '@/assets/images/brand/brand2.png';
import sponsor3 from '@/assets/images/brand/brand3.png';
import sponsor4 from '@/assets/images/brand/brand4.png';
import sponsor5 from '@/assets/images/brand/brand5.png';
import sponsor6 from '@/assets/images/brand/brand6.png';
import sponsor7 from '@/assets/images/brand/brand7.png';
import sponsor8 from '@/assets/images/brand/brand8.png';

const sponsors = ref([
  {
    name: 'Компания 1',
    logo: sponsor1,
    description: 'Генеральный спонсор мероприятия. Оказывает поддержку проекту и развитию событий.',
    link: 'https://sponsor1.ru',
  },
  {
    name: 'Компания 2',
    logo: sponsor2,
    description: 'Партнёр по технологиям и инновациям.',
    link: 'https://sponsor2.ru',
  },
  // Добавьте дополнительные спонсоры по аналогии:
  // {
  //   name: 'Компания 3',
  //   logo: sponsor3,
  //   description: 'Описание компании 3',
  //   link: 'https://sponsor3.ru',
  // },

  {
    name: 'Компания 3',
    logo: sponsor3,
    description: 'Описание компании 3',
    link: 'https://sponsor3.ru',
  },
]);
</script>

<style scoped>
.sponsors-page {
  padding: 40px 0 60px;
  background: #f8f9fa;
}
.sponsors-title {
  text-align: center;
  margin-bottom: 40px;
  font-weight: bold;
  font-size: 2.5rem;
}
.sponsors-logo {
  max-height: 100px;
  max-width: 180px;
  object-fit: contain;
}
</style>
