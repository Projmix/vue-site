import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageView from '../views/PageView.vue'
import { useLayoutStore } from '../stores/layout.js'
import apiService from '../services/apiService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // Event routes
    {
      path: '/event/:id',
      name: 'event',
      component: () => import('../views/SingleEventView.vue')
    },
    // Afisha routes (to match site_menu API)
    {
      path: '/afisha/:category',
      name: 'events-category',
      component: () => import('../views/EventsView.vue')
    },
    // News routes (to match site_menu API)
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/PostsView.vue')
    },
    {
      path: '/news/:slug',
      name: 'news-single',
      component: () => import('../views/SingleBlogView.vue')
    },
    // Custom page routes - must be before the catchall but after specific routes
    {
      path: '/:slug',
      name: 'custom-page',
      component: PageView,
      // Exclude paths that have their own routes
      beforeEnter: (to, from, next) => {
        const reservedPaths = [
          'event', 'news', 'post', 'posts',
          'page'  // Removed 'objects' and 'object' from reserved paths
        ];
        // Check if the route is a reserved path
        if (reservedPaths.includes(to.params.slug)) {
          next({ name: 'ErrorView' });
        } else {
          next();
        }
      }
    },
    // Legacy routes
    {
      path: '/post/:slug',
      name: 'post',
      component: () => import('../views/SingleBlogView.vue')
    },
    {
      path: '/posts',
      name: 'posts',
      redirect: '/news'
    },
    {
      path: '/page/:slug',
      name: 'page',
      component: () => import('../views/PageView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'ErrorView',
      component: () => import('../views/ErrorView.vue'),
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Add navigation guard to handle/reset cache on navigation to home
router.afterEach((to, from) => {
  // If navigating to home, we need to ensure events data is loaded
  if (to.name === 'home' && from.name !== null) {
    // Reset cache only when navigating to home page, not on initial load
    try {
      console.log('[Router] Navigating to home from:', from.path, 'resetting events cache');
      const layoutStore = useLayoutStore();
      if (layoutStore) {
        layoutStore.resetEventsCache();
        // Trigger immediate reload of data
        layoutStore.fetchLayout().catch(error => {
          console.error('[Router] Error reloading layout data:', error);
        });
      }
      
      // Also clear API service cache for home page
      apiService.clearCache('home');
    } catch (error) {
      console.error('[Router] Error resetting layout store:', error);
    }
  }
})

export default router
