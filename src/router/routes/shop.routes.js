const routes = [
  {
    path: '/',
    component: () => import('@/layouts/shop/Index.vue'),
    children: [
      {
        path: '/shop',
        component: () => import('@/components/shop/Shop.vue'),
        name: 'Shop'
      },
      {
        path: '/product',
        component: () => import('@/components/shop/Product.vue'),
        name: 'Product'
      }
    ]
  }
]

export default routes
