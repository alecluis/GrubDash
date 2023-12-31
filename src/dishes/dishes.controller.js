//dishes.controller.js

const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//to validate that the dish has a name
function nameValidation(req, res, next) {
  const { data: name } = req.body
  if (!req.body.data.name || req.body.data.name === "") {
    next({ status: 400, message: `Dish must include a name.` })
  }
  next()
}

//to validate that the dish has a description
function descriptionValidation(req, res, next) {
  const {data: description} = req.body
  if (!req.body.data.description || req.body.data.description === "") {
    next({ status: 400, message: `Dish must include a description.` })
  }
  next()
}

//to validate that the dish has an imageurl
function imageUrlValidation(req, res, next) {
  const {data: image_url} = req.body
  if (!req.body.data.image_url || req.body.data.image_url === "") {
    next({ status: 400, message: `image_url` })
  }
  next()
}

//to validate that the dish has a price
function priceValidation(req, res, next) {
  const { data: price } = req.body
  if (req.body.data.price === null || req.body.data.price === undefined || req.body.data.price === "") {
    next({ status: 400, message: `Dish must include a price.` })
  }
  if (typeof req.body.data.price === "number" && req.body.data.price > 0) {
    return next()
  } else {
    next({ status: 400, message: `The price must be a number greater than 0.` })
  }
  next()
}

//to validate that the dish exists
function dishValidation(req, res, next) {
  const id = req.params.dishId
  const foundId = dishes.filter((dish) => dish.id === id)
  if (foundId.length > 0) {
    res.locals.dish = foundId
    next()
  } else {
    next({ status: 404, message: `Dish ${id} not found.` })
  }
}

//to validate that the id exists and matches route id 
function idValidation(req, res, next) {
  const { data: { id } } = req.body
  const dishId = req.params.dishId
  if (req.body.data.id === null || req.body.data.id === undefined || req.body.data.id === "") {
    return next()
  }
  if (req.body.data.id !== dishId) {
    next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` })
  } else {
    next()
  }
}

//to list all dishes 
function list(req, res) {
  res.json({ data: dishes })
}

//creates a new dish
function create(req, res) {
  const { name, description, price, image_url } = req.body.data
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish)
  res.status(201).json({ data: newDish })
}

//to return a single dish based on id 
function read(req, res, next) {
  const foundDish = res.locals.dish
  if (foundDish) {
    res.json({ data: foundDish[0] })
  }
}

//to change the dish 
function update(req, res, next) {
  const dishId = req.params.dishId
  const { data: { name, description, price, image_url } } = req.body
  const updatedDish = {
    id: dishId,
    name,
    description,
    price,
    image_url,
  }
  res.json({ data: updatedDish })
}


module.exports = {
  list,
  create: [nameValidation, descriptionValidation, imageUrlValidation, priceValidation, create],
  read: [dishValidation, read],
  update: [dishValidation, idValidation, nameValidation, descriptionValidation, imageUrlValidation, priceValidation, update]
}
