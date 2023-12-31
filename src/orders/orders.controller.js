//orders.controller.js

const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

//to validate that the order exists
function orderValidation(req, res, next) {
  const id = req.params.orderId
  const foundOrder = orders.find((order) => order.id === id)
  if (foundOrder) {
    res.locals.order = [foundOrder]
    next()
  } else {
    next({ status: 404, message: `Order ${id} not found.` })
  }
}


//to validate that id matches route id
function idValidation(req, res, next) {
  const orderId = req.params.orderId
  const { data: { id } = {} } = req.body
  if (id === null || id === undefined || id === "") {
    return next()
  }
  if (id !== orderId) {
    next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` })
  } else {
    next()
  }
}

//to validate that the order contains acceptable status
function statusValidation(req, res, next) {
  const { data: { status } = {} } = req.body
  const validStatusValues = ["pending", "preparing", "out-for-delivery", "delivered"]
  if (!status || !validStatusValues.includes(status)) {
    return next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered.` })
  }
  if (status === "delivered") {
    return next({ status: 400, message: `A delivered order cannot be changed.` })
  }
  next()
}

//to validate that order contains acceptable deliverTo values 
function deliverToValidation(req, res, next) {
  const { data: deliverTo } = req.body
  if (!req.body.data.deliverTo || req.body.data.deliverTo === "") {
    next({ status: 400, message: `Order must include a deliverTo.` })
  }
  next()
}

//to validate that order contains acceptable mobileNumber values 
function mobileNumberValidation(req, res, next) {
  const { data: mobileNumber } = req.body
  if (!req.body.data.mobileNumber || req.body.data.mobileNumber === "") {
    next({ status: 400, message: `Order must include a mobileNumber.` })
  }
  next()
}

//to validate that the order contains acceptable dish values 
function dishesValidation(req, res, next) {
  const { data: { dishes } } = req.body
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({ status: 400, message: `Dishes must include at least one dish.` })
  }
  for (let index = 0; index < dishes.length; index++) {
    const dish = dishes[index]
    if (!dish.quantity || !Number.isInteger(dish.quantity) || dish.quantity <= 0) {
      return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0.` })
    }
  }
  res.locals.order = req.body.data
  next()
}

//to list all the orders 
function list(req, res) {
  res.json({ data: orders })
}

//to create a new order 
function create(req, res) {
const newOrder = { ...res.locals.order, id: nextId() }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

//to return order matching id 
function read(req, res) {
  const foundOrders = res.locals.order
  if (foundOrders.length > 0) {
    res.json({ data: foundOrders[0] })
  } else {
    res.status(404).json({ error: `Order not found` })
  }
}

//to change an existing order 
function update(req, res) {
  const orderId = req.params.orderId
  const { data } = req.body
  if (!data) {
    return res.status(400).json({ error: `Request body must include a 'data' property.` })
  }
  const { deliverTo, mobileNumber, status, dishes } = data
  const order = orders.find((order) => order.id === orderId)
  if (!order) {
    return res.status(404).json({ error: `Order ${orderId} not found.` })
  }
  order.deliverTo = deliverTo
  order.mobileNumber = mobileNumber
  order.status = status
  order.dishes = dishes
  return res.json({ data: order })
}

//to destory an order 
function destroy(req, res, next) {
  const orderId = req.params.orderId
  const foundOrder = res.locals.order
  const index = orders.findIndex((order) => order.id === orderId)
  if (index !== -1) {
    if (foundOrder[0].status === "pending") {
      const deletedOrder = orders.splice(index, 1)
      res.sendStatus(204)
    } else {
      next({ status: 400, message: `An order cannot be deleted unless it is pending.` })
    }
  } else {
    next({ status: 404, message: `Order ${orderId} not found.` })
  }
}


module.exports = {
  list,
  create: [dishesValidation, deliverToValidation, mobileNumberValidation, create],
  read: [orderValidation, read],
  update: [orderValidation, idValidation, statusValidation, dishesValidation, deliverToValidation, mobileNumberValidation, update],
  destroy: [orderValidation, destroy]
}