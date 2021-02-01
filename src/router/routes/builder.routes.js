const routes = [
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/basic/Index.vue'),
    children: [
      {
        path: 'developer/:uuid',
        name: 'Builder',
        component: () => import('@/views/builder/developer/Index.vue')
      }
    ]
  }
]

export default routes
