<script>
import { useLayoutStore } from "../stores/layout.js";
import { computed } from 'vue';

export default {
  name: "Header",
  setup() {
    const store = useLayoutStore();
    const layout = computed(() => store.getLayout);
    const logo = computed(() => store.getLogo);
    return {
      layout,
      logo
    };
  },
  data() {
    return {
    };
  },
  methods: {
  },
  beforeMount() {
  },
};
</script>

<template>
  <!-- BEGIN | Header -->
  <header class="ht-header full-width-hd">
    <div id="header-one" class="header-area header-fixed full-width-compress2 light-header">
      <div class="main-menu-area" id="sticker">
        <div class="container-fluid">
          <div class="row no-gutters d-flex align-items-center">
            <div class="col-lg-2 col-md-3 d-none d-lg-block">
              <div class="logo-area">
                <a href="index.html">
                  <img src="../assets/images/logo-dark2.png" alt="logo">
                </a>
              </div>
            </div>
            <div class="col-lg-7 col-md-6 possition-static">
              <div class="eventalk-main-menu">
                <nav class="d-none d-lg-block">
                  <ul>
                    <li class="current">
                      <a href="#">Home</a>
                      <ul class="rt-dropdown-menu third-level">
                        <li>
                          <ul>
                            <li>
                              <a href="index.html">Home 1 (Multi Page)</a>
                            </li>
                            <li>
                              <a href="index2.html">Home 2 (Multi Page)</a>
                            </li>
                            <li>
                              <a href="index3.html">Home 3 (Multi Page)</a>
                            </li>
                            <li class="current">
                              <a href="index4.html">Home 4 (Multi Page)</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <ul>
                            <li>
                              <a href="one-page-index.html">Home 1 (One Page)</a>
                            </li>
                            <li>
                              <a href="one-page-index2.html">Home 2 (One Page)</a>
                            </li>
                            <li>
                              <a href="one-page-index3.html">Home 3 (One Page)</a>
                            </li>
                            <li>
                              <a href="one-page-index4.html">Home 4 (One Page)</a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li class="menu-justify">
                      <a href="#">Pages</a>
                      <div class="rt-dropdown-mega container">
                        <div class="rt-dropdown-inner">
                          <div class="row">
                            <div class="col-sm-3">
                              <ul class="rt-mega-items">
                                <li>
                                  <a href="about.html">About</a>
                                </li>
                                <li>
                                  <a href="pricing-table1.html">Pricing Table 1</a>
                                </li>
                                <li>
                                  <a href="pricing-table2.html">Pricing Table 2</a>
                                </li>
                                <li>
                                  <a href="pricing-table3.html">Pricing Table 3</a>
                                </li>
                              </ul>
                            </div>
                            <div class="col-sm-3">
                              <ul class="rt-mega-items">
                                <li>
                                  <a href="comingsoon-event.html">Comingsoon Event</a>
                                </li>
                                <li>
                                  <a href="shop.html">Shop</a>
                                </li>
                                <li>
                                  <a href="single-shop.html">Shop Details</a>
                                </li>
                                <li>
                                  <a href="single-event.html">Single Event</a>
                                </li>
                              </ul>
                            </div>
                            <div class="col-sm-3">
                              <ul class="rt-mega-items">
                                <li>
                                  <a href="gallery.html">Gallery</a>
                                </li>
                                <li>
                                  <a href="blog-standard.html">Blog Standard</a>
                                </li>
                                <li>
                                  <a href="blog-masonry.html">Blog Masonry</a>
                                </li>
                                <li>
                                  <a href="single-blog.html">Blog Details</a>
                                </li>
                              </ul>
                            </div>
                            <div class="col-sm-3">
                              <ul class="rt-mega-items">
                                <li>
                                  <a href="single-speakers.html">Speaker Details</a>
                                </li>
                                <li>
                                  <a href="sponsors.html">Sponsors</a>
                                </li>
                                <li>
                                  <a href="contact.html">Contact</a>
                                </li>
                                <li>
                                  <a href="404.html">404</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <a href="#">Speakers</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="speakers1.html">Speakers 1</a>
                        </li>
                        <li>
                          <a href="speakers2.html">Speakers 2</a>
                        </li>
                        <li>
                          <a href="speakers3.html">Speakers 3</a>
                        </li>
                        <li>
                          <a href="single-speakers.html">Speaker Details</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Schedule</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="schedule1.html">Schedule 1</a>
                        </li>
                        <li>
                          <a href="schedule2.html">Schedule 2</a>
                        </li>
                        <li>
                          <a href="schedule3.html">Schedule 3</a>
                        </li>
                        <li>
                          <a href="schedule4.html">Schedule 4</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="sponsors.html">Sponsors</a>
                    </li>
                    <li>
                      <a href="contact.html">Contact</a>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu start -->
                <nav id="dropdown" class="d-md-none">
                  <ul>
                    <li>
                      <a href="#">Home</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="index.html">Home 1 (Multi Page)</a>
                        </li>
                        <li>
                          <a href="index2.html">Home 2 (Multi Page)</a>
                        </li>
                        <li>
                          <a href="index3.html">Home 3 (Multi Page)</a>
                        </li>
                        <li>
                          <a href="index4.html">Home 4 (Multi Page)</a>
                        </li>
                        <li>
                          <a href="one-page-index.html">Home 1 (One Page)</a>
                        </li>
                        <li>
                          <a href="one-page-index2.html">Home 2 (One Page)</a>
                        </li>
                        <li>
                          <a href="one-page-index3.html">Home 3 (One Page)</a>
                        </li>
                        <li>
                          <a href="one-page-index4.html">Home 4 (One Page)</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Pages</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="about.html">About</a>
                        </li>
                        <li>
                          <a href="pricing-table1.html">Pricing Table 1</a>
                        </li>
                        <li>
                          <a href="pricing-table2.html">Pricing Table 2</a>
                        </li>
                        <li>
                          <a href="pricing-table3.html">Pricing Table 3</a>
                        </li>
                        <li>
                          <a href="comingsoon-event.html">Comingsoon Event</a>
                        </li>
                        <li>
                          <a href="shop.html">Shop</a>
                        </li>
                        <li>
                          <a href="single-shop.html">Shop Details</a>
                        </li>
                        <li>
                          <a href="blog-standard.html">Blog Standard</a>
                        </li>
                        <li>
                          <a href="blog-masonry.html">Blog Masonry</a>
                        </li>
                        <li>
                          <a href="single-blog.html">Blog Details</a>
                        </li>
                        <li>
                          <a href="gallery.html">Gallery</a>
                        </li>
                        <li>
                          <a href="contact.html">Contact</a>
                        </li>
                        <li>
                          <a href="404.html">404</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Speakers</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="speakers1.html">Speakers 1</a>
                        </li>
                        <li>
                          <a href="speakers2.html">Speakers 2</a>
                        </li>
                        <li>
                          <a href="speakers3.html">Speakers 3</a>
                        </li>
                        <li>
                          <a href="single-speakers.html">Speaker Details</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Schedule</a>
                      <ul class="rt-dropdown-menu">
                        <li>
                          <a href="schedule1.html">Schedule 1</a>
                        </li>
                        <li>
                          <a href="schedule2.html">Schedule 2</a>
                        </li>
                        <li>
                          <a href="schedule3.html">Schedule 3</a>
                        </li>
                        <li>
                          <a href="schedule4.html">Schedule 4</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="sponsors.html">Sponsors</a>
                    </li>
                    <li>
                      <a href="contact.html">Contact</a>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu End -->
              </div>
            </div>
            <div class="col-lg-3 col-md-3 d-none d-lg-block">
              <ul class="header-action-items">
                <li>
                  <a href="#" title="Buy Tickets" class="btn-fill size-xs color-yellow border-radius-5">Buy Tickets</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <!-- END | Header -->
</template>

<style scoped></style>
