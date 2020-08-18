const LoadProductService = require('../services/LoadProductServices')
const User = require('../models/User')
const Order = require('../models/Order')

const Cart = require('../../lib/cart')
const mailer = require('../../lib/mailer')
const { formatPrice, date } = require('../../lib/utils')

const email = (seller, product, buyer) => `
<h1>Cid Store</h1>
<p><br/><br/></p>
<h2>Olá ${seller.name},</h2>
<p>Boa notícia! Você vendeu!</p>
<p>Produto: ${product.name}</p>
<p>Valor: ${product.formattedPrice} /unid.</p>
<p><br/><br/></p>
<h3>Envio</h3>
<p>Você pode combinar o envio diretamente com o comprador</p>
<p><br/><br/></p>
<h3>Dados do comprador</h3>
<p>${buyer.name}</p>
<p>${buyer.email}</p>
<p>${buyer.address}</p>
<p>${buyer.cep}</p>
<p><br/><br/></p>
<p><strong>Entre em contato com o comprador para finalizar a venda!</strong></p>
<p><br/><br/></p>
<h3>Como faço a entrega</h3>
<p>Combine de se encontrar em um lugar público para entregar o produto.</p>
<p>Se for enviar o produto, utilize serviços com seguro, lembre-se de informar os dados do comprador e guarde a cópia do comprovante de envio.</p>
<p><br/><br/></p>
<p>Atenciosamente,</p>
<p>Equipe Cid Store</p>
`

module.exports = {
  async index(req, res) {
    // find users/buyers orders
    let orders = await Order.findAll({where: {buyer_id: req.session.userId} })

    const getOrdersPromise = orders.map(async order => {
      // product details
      order.product = await LoadProductService.load('product', {
        where: { id: order.product_id }
      })

      // buyer details
      order.buyer = await User.findOne({
        where: { id: order.buyer_id }
      })

      // seller details
      order.seller = await User.findOne({
        where: { id: order.seller_id }
      })

      // price formatting
      order.formattedPrice = formatPrice(order.price)
      order.formattedTotal = formatPrice(order.total)

      // status formatting
      const statuses = {
        open: 'Aberto',
        transit: 'Em transito',
        delivered: 'Entregue',
        canceled: 'Cancelado'
      }

      order.formattedStatus = statuses[order.status]

      // updated formatting
      const updatedAt = date(order.updated_at)
      order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} ás ${updatedAt.hour}:${updatedAt.minutes}`

      return order
    })

    orders = await Promise.all(getOrdersPromise)

    return res.render('orders/index', { orders })

  },
  async post(req, res) {
    try {
      // get products in cart
      const cart = Cart.init(req.session.cart)

      const buyer_id = req.session.userId
      const filteredItems = cart.items.filter(item => 
        item.product.user_id != buyer_id
      )
      // create order
      const createOrdersPromise = filteredItems.map(async item => {
        let { product, price: total, quantity } = item
        const { price, id: product_id, user_id: seller_id } = product
        const status = "open"

        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          quantity,
          total,
          status
        })

        // get products data
        product = await LoadProductService.load('product', {
          where: {
            id: product_id
          }
        })

        // get data seller
        const seller = await User.findOne({ where: { id: seller_id } })

        // get data buyer
        const buyer = await User.findOne({ where: { id: buyer_id } })

        // send email with buy data for seller
        await mailer.sendMail({
          to: seller.email,
          from: 'no-reply@cidstore.com.br',
          subject: 'Você vendeu em Cid Store!',
          html: email(seller, product, buyer)
        })

        return order
      })

      await Promise.all(createOrdersPromise)

      // clear cart
      delete req.session.cart
      Cart.init()

      // notify user with success message 
      return res.render('orders/success')
      
    }
    catch (err) {
      console.error(err)
      return res.render('orders/error')
    }
  }
}