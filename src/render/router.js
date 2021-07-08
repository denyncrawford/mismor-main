import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
        path: '/',
        name: 'index',
        component: () => import("./views/Index.vue"),
        meta: {
            title: 'Sistema de control'
        }
    },
    {
        path: '/create',
        name: 'create',
        component: () => import("./views/Create.vue"),
        meta: {
            title: 'Ingresar remito'
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
