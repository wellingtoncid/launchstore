const express = require('express')
const routes = express.Router()
const HomeController = require('../app/controllers/HomeController')

const products = require('./products')
const users = require('./users')
const cart = require('./cart')
const orders = require('./orders')

routes.get('/', HomeController.index)

routes.use('/products', products)
routes.use('/users', users)
routes.use('/cart', cart)
routes.use('/orders', orders)

// alias

routes.get('/ads/create', (req, res) => res.redirect('/products/create'))
routes.get('/account', (req, res) => res.redirect('/users/login'))


module.exports = routes 