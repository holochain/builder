const routes = [
  {
    path: '/ledger',
    component: () => import('@/layouts/ledger/Index.vue'),
    children: [
      {
        path: 'invoices',
        name: 'Invoices',
        meta: { requiresAuth: true },
        components: {
          default: () => import('@/views/ledger/invoices/Index.vue'),
          navDrawer: () => import('@/views/ledger/drawer/Index.vue')
        }
      },
      {
        path: 'clients',
        name: 'Clients',
        meta: { requiresAuth: true },
        components: {
          default: () => import('@/views/ledger/clients/Index.vue'),
          navDrawer: () => import('@/views/ledger/drawer/Index.vue')
        }
      }
    ]
  }
]

export default routes
