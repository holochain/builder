const routes = [
  {
    path: '/conductor',
    name: '',
    component: () => import('@/layouts/basic/Index.vue'),
    children: [
      {
        path: 'applications',
        name: 'Conductor Applications',
        component: () => import('@/views/conductor/applications/Index.vue')
      }
    ]
  }
]

export default routes
