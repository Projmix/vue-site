<script setup>
import { useLayoutStore } from "../stores/layout.js";
import { computed, onMounted } from 'vue';

const layoutStore = useLayoutStore();
// const logoUrl = computed(() => layoutStore.getCompanyLogoUrl); // Old getter
const logoUrl = computed(() => layoutStore.getSiteHeaderLogo); // New getter for site_logo
const layout = computed(() => layoutStore.getLayout);
const siteMenu = computed(() => layoutStore.getSiteMenu);
const purchaseUrl = computed(() => {
  const url = layoutStore.getObjectPurchaseUrl;
  console.log('[header] Current object ID:', layoutStore.getObjectId);
  console.log('[header] Purchase URL:', url);
  return url;
});

// Проверяем наличие дочерних элементов в пунктах меню
function hasChildren(menuItem) {
  return menuItem.children && menuItem.children.length > 0;
}

// Инициализация
onMounted(async () => {
  console.log('[header] Component mounted, initializing...');
  try {
    // Ensure layout data is loaded
    await layoutStore.fetchLayout();
    console.log('[header] Layout data loaded');
    
  initStickyHeader();
  // Re-initialize on window resize
  window.addEventListener('resize', initStickyHeader);
  // Handle scroll event for sticky header
  window.addEventListener('scroll', handleStickyHeader);
  } catch (error) {
    console.error('[header] Error during initialization:', error);
  }
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
                <nav class="d-none d-lg-block desktop-menu">
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
                <nav id="dropdown" class="d-md-none mobile-menu">
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
                  <a :href="purchaseUrl" title="Купить" class="btn-fill size-xs color-yellow border-radius-5" target="_blank">Купить</a>
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

<style>
  /* .eventalk-main-menu {
    padding-right: 22%;
  } */

  
  /* Sticky header styling */
  .main-menu-area{
    background-color: var(--theme-main-color);
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
    padding-top: 105px;
  }

  /* FOUC Prevention: Initially hide the main menu wrapper */
  .eventalk-main-menu {
    visibility: hidden;
  }

  /* Make desktop menu visible OR when meanMenu has initialized */
  .desktop-menu,
  .mean-container .eventalk-main-menu {
    visibility: visible;
  }

  /* On desktop screens (>= 992px) */
  @media (min-width: 992px) {
    .eventalk-main-menu { /* Ensure main wrapper is visible */
      visibility: visible;
    }
    .desktop-menu { /* Ensure desktop menu is displayed */
      display: block !important; /* Or whatever its natural display type is */
    }
    .mobile-menu { /* Ensure original mobile nav (#dropdown) is hidden */
      display: none !important;
    }
  }

  /* On mobile screens (<= 991px) */
  @media (max-width: 991px) {
    /* Hide desktop-specific elements */
    .desktop-menu,
    .header-area .col-lg-2.d-none.d-lg-block, /* Desktop Logo Column */
    .header-area .col-lg-3.d-none.d-lg-block { /* Desktop Tickets Column */
      display: none !important;
    }

    header.ht-header { /* Adjust header padding on mobile */
      padding-top: 0 !important;
    }

    /* Neutralize #header-one.header-fixed on mobile */
    #header-one.header-fixed {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important; /* Or auto, depending on desired behavior */
      background-color: transparent !important;
      box-shadow: none !important;
      z-index: auto !important;
      height: auto !important; /* Let its content define its height */
    }

    .main-menu-area { /* Adjust for meanMenu bar height and remove conflicting background */
      min-height: 60px; /* Example height, adjust as needed */
      background-color: transparent !important; /* meanMenu bar will have its own background */
    }
    
    .mobile-menu { /* The source nav#dropdown for meanMenu */
        /* It is hidden by d-md-none initially, meanMenu will process it. */
        /* No specific display rule needed here unless to override something. */
    }
  }

  /* Styles for the logo within the generated meanMenu bar */
  :global(.mean-bar .mobile-menu-nav-back) {
    /* Add padding or background if needed for the logo container */
    /* background: rgba(17, 17, 17, 0.9); */ /* If mean-bar itself is transparent */
    padding: 5px 0; /* Adjust vertical padding for the logo */
  }

  :global(.mean-bar .mobile-menu-nav-back img) {
    height: 35px;
    object-fit: contain;
    display: block; /* Allows margin auto to work for centering */
    margin: 0 auto; /* Centers the image if its container has width */
  }
</style>
