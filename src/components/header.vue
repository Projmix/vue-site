<script setup>
import { useLayoutStore } from "../stores/layout.js";
import { computed, onMounted } from 'vue';

const layoutStore = useLayoutStore();
const logoUrl = computed(() => layoutStore.getCompanyLogoUrl);
const layout = computed(() => layoutStore.getLayout);
const siteMenu = computed(() => layoutStore.getSiteMenu);

// Проверяем наличие дочерних элементов в пунктах меню
function hasChildren(menuItem) {
  return menuItem.children && menuItem.children.length > 0;
}

// Инициализация sticky header
onMounted(() => {
  initStickyHeader();
  
  // Re-initialize on window resize
  window.addEventListener('resize', initStickyHeader);
  
  // Handle scroll event for sticky header
  window.addEventListener('scroll', handleStickyHeader);
});

function initStickyHeader() {
  // Ensure jQuery is loaded
  if (window.$) {
    // Reset any existing styles
    $('#sticker').removeClass('stick');
    $('body').css('padding-top', '');
  }
}

function handleStickyHeader() {
  if (!window.$) return;
  
  const s = $('#sticker');
  const w = $('body');
  const h = s.outerHeight();
  const windowpos = $(window).scrollTop();
  const windowWidth = $(window).width();
  const h1 = s.parent('#header-one');
  
  if (windowWidth > 991) {
    w.css('padding-top', '');
    let topBarH = 1;
    
    if (windowpos >= topBarH) {
      s.addClass('stick');
    } else {
      s.removeClass('stick');
      w.css('padding-top', 0);
    }
  }
}
</script>

<template>
  <!-- BEGIN | Header -->
  <header class="ht-header full-width-hd">
    <div id="header-one" class="header-area header-fixed full-width-compress">
      <div class="main-menu-area" id="sticker">
        <div class="container-fluid">
          <div class="row no-gutters d-flex align-items-center">
            <div class="col-lg-2 col-md-2 d-none d-lg-block">
              <div class="logo-area">
                <router-link :to="{ name: 'home' }">
                  <img :src="logoUrl" alt="logo" style="width:179px; height:46px; object-fit:contain;">
                </router-link>
              </div>
            </div>
            <div class="col-lg-7 col-md-6 possition-static">
              <div class="eventalk-main-menu">
                <nav class="d-none d-lg-block">
                  <ul>
                    <!-- Динамическое меню из API -->
                    <li v-for="item in siteMenu" :key="item.href">
                      <router-link v-if="item.href.startsWith('/')" :to="item.href" :title="item.title">
                        {{ item.text }}
                      </router-link>
                      <a v-else :href="item.href" :title="item.title" :target="item.target">
                        {{ item.text }}
                      </a>
                      
                      <!-- Выпадающее меню для пунктов с дочерними элементами -->
                      <ul v-if="hasChildren(item)" class="rt-dropdown-menu">
                        <li v-for="child in item.children" :key="child.href">
                          <router-link v-if="child.href.startsWith('/')" :to="child.href" :title="child.title">
                            {{ child.text }}
                          </router-link>
                          <a v-else :href="child.href" :title="child.title" :target="child.target">
                            {{ child.text }}
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu start -->
                <nav id="dropdown" class="d-md-none">
                  <ul>
                    <!-- Динамическое меню для мобильных из API -->
                    <li v-for="item in siteMenu" :key="item.href">
                      <router-link v-if="item.href.startsWith('/')" :to="item.href" :title="item.title">
                        {{ item.text }}
                      </router-link>
                      <a v-else :href="item.href" :title="item.title" :target="item.target">
                        {{ item.text }}
                      </a>
                      
                      <!-- Выпадающее меню для пунктов с дочерними элементами -->
                      <ul v-if="hasChildren(item)" class="rt-dropdown-menu">
                        <li v-for="child in item.children" :key="child.href">
                          <router-link v-if="child.href.startsWith('/')" :to="child.href" :title="child.title">
                            {{ child.text }}
                          </router-link>
                          <a v-else :href="child.href" :title="child.title" :target="child.target">
                            {{ child.text }}
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
                <!-- Mobile Menu End -->
              </div>
            </div>
            <div class="col-lg-3 col-md-4 d-none d-lg-block">
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

<style scoped>
.eventalk-main-menu {
  padding-right: 22%;
}

.inner-page-banner {
  height: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  position: relative;
}

/* Sticky header styling */
.main-menu-area{
  background-color: rgba(17, 17, 17, 0.9)
}
.main-menu-area.stick {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
}
header{
  padding-top: 150px;
}
</style>
