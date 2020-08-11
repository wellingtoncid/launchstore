const User = require('../models/User')

const { hash } = require('bcryptjs')
const crypto = require('crypto')
const mailer = require('../../lib/mailer')

module.exports = {
    loginForm(req, res) {
        return res.render('session/login')
    },
    login(req, res) {
       req.session.userId = req.user.id

       return res.redirect('/users')
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect('/')
    },
    forgotForm(req, res) {
        return res.render('session/forgot-password')
    },
    async forgot(req, res) {
        const user = req.user

        try {

            const token = crypto.randomBytes(20).toString("hex")
            // create expiration
            let now = new Date()
            now = now.setHours(now.getHours() + 1)

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })
            // email with link 
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Recuperação de senha',
                html: `<h2>Perdeu a senha?</h2>
            <p>Não se preocupe, clique no link abaixo</p>
            <p>
                <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                    RECUPERAR SENHA
                </a>
            </p>
            `,
            })
            // avisar usuario
            return res.render('session/forgot-password', {
                success: "Verifique sua caixa de e-mail para recuperar sua senha!"
            })



        }catch(err){
            console.error(err)
            return res.render('session/forgot-password', {
                error: "Erro inesperado. Tente novamente!"
            })
        }
        // token user
    },
    resetForm(req, res) {
        return res.render('session/password-reset', { token: req.query.token })
    },
    async reset(req, res) {
        const user = req.user
        const { password, token } = req.body

        try {
            // cria um novo hash de senha
            const newPassword = await hash(password, 8)
            
            // atualiza usuario
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: "",
            })

            // avisa usuario que ele tem uma nova senha
            return res.render('session/login', {
                user: req.body,
                success: 'Senha atualizada! Bem vindo de volta, faça login novamente!'
            })


        }catch(err) {
            console.error(err)
            return res.render('session/password-reset', {
                user: req.body,
                token,
                error: "Erro inesperado. Tente novamente!"
            })
        }
    }
}