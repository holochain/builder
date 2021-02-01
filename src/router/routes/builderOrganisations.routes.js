const routes = [
  {
    path: '/builder',
    name: '',
    component: () => import('@/layouts/basic/Index.vue'),
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
