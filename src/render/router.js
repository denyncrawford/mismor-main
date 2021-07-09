import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
        path: '/',
        name: 'loading',
        component: () => import("./components/Loading.vue"),
        meta: {
            title: 'Cargando...'
        }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import("./views/Index.vue"),
        meta: {
            title: 'Panel de control'
        }
    },
    {
        path: '/create',
        name: 'create',
        component: () => import("./views/Create.vue"),
        meta: {
            title: 'Ingresar registro'
        }
    },
    {
        path: '/edit/:id',
        name: 'edit',
        component: () => import("./views/Editar.vue"),
        meta: {
            title: 'Editar registro'
        }
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import("./views/Clients.vue"),
      meta: {
          title: 'Control de clientes'
      }
    },
    {
      path: '/config',
      name: 'configure',
      component: () => import("./views/Config.vue"),
      meta: {
          title: 'Configurar'
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

export default router
