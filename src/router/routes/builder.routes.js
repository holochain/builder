const routes = [
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/builder/Index.vue'),
    children: [
      {
        path: 'developer',
        name: 'Builder',
        component: () => import('@/views/builder/developer/Index.vue')
      }
    ]
  },
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/builder/Index.vue'),
    children: [
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/views/builder/kanban/cards/Index.vue')
      }
    ]
  },
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/builder/Index.vue'),
    children: [
      {
        path: 'organisations',
        name: 'Organisations',
        component: () => import('@/views/builder/organisations/Index.vue')
      }
    ]
  }
]

export default routes
