const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const errorController = require('./controllers/error')
const db = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded(
  {
    extended: false
  }
))

app.use(express.static(
  path.join(__dirname, 'public')
))

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => {
      console.log(err)
    })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404)

Product.belongsTo(User, { constrains: true, onDelete: 'CASCADE' })
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })

db.sync({ alter: true })
  .then(result => {
    return User.findByPk(1)
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'test', email: 'test@test.io' })
    }
    return user
  })
  .then(async user => {
    const cart = await user.getCart()
    if (!cart) {
      return user.createCart()
    }
    return cart
  })
  .then(cart => {
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  })
