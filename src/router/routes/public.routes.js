const routes = [
  {
    path: '/',
    // Layouts allow you to define different
    // structures for different view
    component: () => import('@/layouts/basic/Index.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/Index.vue')
      }
    ]
  }
]

export default routes
