const routes = [
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/basic/Index.vue'),
    children: [
      {
        path: '',
        name: 'Builder',
        component: () => import('@/views/builder/Index.vue')
      }
    ]
  }
]

export default routes
