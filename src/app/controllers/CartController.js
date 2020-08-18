const Cart = require('../../lib/cart')

const LoadProductService = require('../services/LoadProductServices')

module.exports = {
  async index(req, res) {
    try{
      let { cart } = req.session
      
      // cart manager
      cart = Cart.init(cart)

      return res.render('cart/index', { cart })
    }
    catch (err) {
      console.error(err)
    }
  },
  async addOne(req, res) {
    // get product id and product
    const { id } = req.params

    const product = await LoadProductService.load('product', { where: { id } })

    // get session cart
    let { cart } = req.session

    // add product in cart (with cart manager)
    cart = Cart.init(cart).addOne(product)

    // update session cart
    req.session.cart = cart

    // redirect user for cart session
    return res.redirect('/cart')

  },
  removeOne(req, res) {
    // get product id
    let { id } = req.params
    
    // take cart session
    let { cart } = req.session
    
    // if not cart, return
    if(!cart) return res.redirect('/cart')

    // cart init (cart manager) and update cart, removing 1 item
    req.session.cart = Cart.init(cart).removeOne(id)

    // redirect for cart page
    return res.redirect('/cart')

  },
  delete(req, res) {
    let { id } = req.params
    let { cart } = req.session
    
    if(!cart) return

    req.session.cart = Cart.init(cart).delete(id)

    return res.redirect('/cart')
  }

}