const { formatPrice } = require('../../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')

module.exports = {
    async create(req, res) {
        const results = await Category.all()
        const categories = results.rows

        return res.render('products/create', { categories })
    },
    async post(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] === "")
                return res.send('Please, fill all fields!')
        }

        const results = await Product.create(req.body)
        const productId = results.rows[0].id

        return res.redirect(`/products/${productId}/edit`)
    },
    async edit(req, res) {
        let results = await Product.find(req.params.id)
        const product = results.rows[0]

        if(!product)
            res.send('Product not found!')

        product.old_price = formatPrice(product.old_price)
        product.price = formatPrice(product.price)

        results = await Category.all()
        const categories = results.rows

        return res.render('products/edit', { product, categories })
    },
    async put(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] === "")
                return res.send('Please, fill all fields!')
        }

        req.body.price = req.body.price.replace(/\D/g, '')
        req.body.old_price = req.body.old_price.replace(/\D/g, '')
        
        if(req.body.old_price != req.body.price) {
            const oldProduct = await Product.find(req.body.id)
            req.body.old_price = oldProduct.rows[0].price
        }

        await Product.update(req.body)

        return res.redirect(`/products/${req.body.id}/edit`)
    },
    async delete(req, res) {
        await Product.delete(req.body.id)

        return res.redirect(`/products/create`)
    }
}