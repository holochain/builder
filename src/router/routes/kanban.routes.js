const routes = [
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/basic/Index.vue'),
    children: [
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/views/kanban/cards/Index.vue')
      }
    ]
  }
]

export default routes
