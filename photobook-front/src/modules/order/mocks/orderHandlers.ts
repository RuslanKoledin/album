import { createOrderHandler } from './createOrderHandler'
import { getOrderHandler } from './getOrderHandler'
import { getOrdersHandler } from './getOrdersHandler'

export const orderHandlers = [
  getOrdersHandler,
  createOrderHandler,
  getOrderHandler,
]
