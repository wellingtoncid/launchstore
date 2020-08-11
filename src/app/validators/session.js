const User = require('../models/User')
const { compare } = require('bcryptjs')

function checkAllFields(body) {
  const keys = Object.keys(body)

  for (key of keys) {
    if (body[key] == "") {
      return {
        user: body,
        error: 'Por favor, preencha todos os campos!'
      }
    }
  }
}

async function login(req, res, next) {
  const { email, password } = req.body

  const user = await User.findOne({ where: { email } })

  if (!user) return res.render('session/login', {
    user: req.body,
    error: 'Usuário não cadastrado'
  })

  const passed = await compare(password, user.password)

  if (!passed) return res.render('session/login', {
    user: req.body,
    error: 'Senha incorreta'
  })

  req.user = user

  next()

}

async function forgot(req, res, next) {
  const { email } = req.body

  try {
    let user = await User.findOne({where: { email } })

    if (!user) return res.render('session/forgot-password', {
      user: req.body,
      error: 'Email não cadastrado'
    })

    req.user = user

    next()
  }catch(err){
    console.error(err)
  }
}

async function reset(req, res, next) {

const { email, password, token, passwordRepeat } = req.body

  const user = await User.findOne({ where: { email } })

  if (!user) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: 'Usuário não cadastrado'
  })

  if (password != passwordRepeat) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: 'As senhas não coincidem, por favor, verificar.'
  })

  // verificar o token confere
  if (token != user.reset_token) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: 'Token inválido. Solicite a recuperação de senha novamente!'
  })

  // verificar se token esta expirado
  let now = new Date()
  now = now.setHours(now.getHours())

  if (now > user.reset_token_expires) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: 'Token expirado. Solicite a recuperação de senha novamente!'
  })

  req.user = user
  next()
  
}

module.exports = {
 login,
 forgot,
 reset
}