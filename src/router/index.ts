import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'
import { UserLevel } from '@/types'
import { useUserStore } from '@/stores/userStore'

import LoginPage from '@/pages/LoginPage.vue'
import UsersPage from '@/pages/UsersPage.vue'
import UploadPage from '@/pages/UploadPage.vue'
import UploadPeriodPage from '@/pages/UploadPeriodPage.vue'
import LogoutPage from '@/pages/LogoutPage.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'




const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      requiresAuth: false,
      title: 'Login',
    },
  },

  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/upload',
      },
      {
        path: 'users',
        name: 'Users',
        component: UsersPage,
        meta: {
          requiresAuth: true,
          requiredLevel: UserLevel.ADMIN,
          title: 'Usuários',
        },
      },
      {
        path: 'upload',
        name: 'Upload',
        component: UploadPage,
        meta: {
          requiresAuth: true,
          requiredLevel: UserLevel.VIEWER,
          title: 'Upload Automático',
        },
      },
      {
        path: 'upload-periodo',
        name: 'UploadPeriodo',
        component: UploadPeriodPage,
        meta: {
          requiresAuth: true,
          requiredLevel: UserLevel.VIEWER,
          title: 'Upload por Período',
        },
      },
      {
        path: 'logout',
        name: 'Logout',
        component: LogoutPage,
        meta: {
          requiresAuth: true,
          title: 'Sair',
        },
      },

    ],
  },
  {
    // Rota catch-all — redireciona para login
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ============================================================
// Navigation Guards
// ============================================================

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // Atualiza título da página
  document.title = to.meta.title
    ? `${to.meta.title} — Upload Caule`
    : 'Upload Caule'

  // Se a rota requer autenticação
  if (to.meta.requiresAuth !== false && to.path !== '/login') {
    if (!userStore.logado) {
      return next('/login')
    }


  }

  // Se já está autenticado e tenta ir para login, redireciona
  if (to.path === '/login' && userStore.logado) {
    return next(userStore.logado ? '/users' : '/upload')
  }

  next()
})

export default router
