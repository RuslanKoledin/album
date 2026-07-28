import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  layout('routes/marketing-layout.tsx', [
    index('routes/home.tsx'),
    route('books', 'routes/books.tsx'),
    route('help', 'routes/help.tsx'),
  ]),
  route('login', 'routes/login.tsx'),
  route('login/verify', 'routes/login-verify.tsx'),
  route('create', 'routes/create.tsx'),
  route('projects/:projectId/editor', 'routes/project-editor.tsx'),
  route('projects/:projectId/preview', 'routes/project-preview.tsx'),
  route('checkout/:projectId', 'routes/checkout.tsx'),
  route('orders/:orderId', 'routes/order.tsx'),
  route('operator/orders/:orderId', 'routes/operator-order.tsx'),
  route('account', 'routes/account.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
