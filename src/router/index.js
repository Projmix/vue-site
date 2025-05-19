import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
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
      path: '/afisha',
      name: 'afisha',
      redirect: to => {
        // Default redirect to 'theatre' category or first available
        return { name: 'events-category', params: { category: 'theatre' } }
      }
    },
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
    // About route (to match site_menu API)
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/SponsorsView.vue')
    },
    // Legacy routes
    {
      path: '/post/:slug',
      name: 'post',
      component: () => import('../views/SingleBlogView.vue')
    },
    {
      path: '/sponsors',
      name: 'sponsors',
      redirect: '/about'
    },
    {
      path: '/posts',
      name: 'posts',
      redirect: '/news'
    },
    {
      path: '/objects',
      name: 'objects',
      component: () => import('../views/ObjectsView.vue')
    },
    {
      path: '/object/:id',
      name: 'object',
      component: () => import('../views/ObjectView.vue')
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

export default router
