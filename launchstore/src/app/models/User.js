const db = require('../../config/db')
const { hash } = require('bcryptjs')
const fs = require('fs')

const Product = require('./Product')

module.exports = {
    async create(data) {
        try {
            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    cpf_cnpj,
                    cep,
                    address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `
            data.password = await hash(data.password, 8)
            const values = [
                data.name,
                data.email,
                data.password,
                data.cpf_cnpj.replace(/\D/g, ''),
                data.cep,
                data.address
            ]

            const results = await db.query(query, values)

            return results.rows[0].id           
        } catch(err) {
            console.error(err)
        }
    },
    async findOne(filters) {
        try {
            let query = `SELECT * FROM users`

            Object.keys(filters).map(key => {
                query = `${query}
                    ${key}
                `
                Object.keys(filters[key]).map(field => {
                    query = `${query}
                        ${field} = '${filters[key][field]}'
                    `
                })
            })

            const results = await db.query(query)

            return results.rows[0]
        } catch(err) {
            console.error(err)
        }
    },
    async update(id, fields) {
        try {
            let query = `UPDATE users SET`

            Object.keys(fields).map((key, index, array) => {
                if((index + 1) < array.length) {
                    query = `${query}
                        ${key} = '${fields[key]}',
                    `
                } else {
                    query = `${query}
                        ${key} = '${fields[key]}'
                        WHERE id = ${id}
                    `
                }
            })

            return await db.query(query)
        } catch(err) {
            console.error(err)
        }
    },
    async products(id) {
        try {
            const results = await db.query(`
                SELECT * FROM products
                WHERE user_id = $1
            `, [id])

            return results.rows
        } catch(err) {
            console.error(err)
        }
    },
    async delete(id) {
        try {

            const products = await this.products(id)

            const filesPromise = products.map(product => Product.files(product.id))

            const productsFiles = await Promise.all(filesPromise)
            
            console.log(productsFiles)
            
            productsFiles.map(product => product.map(file => {
                try {    
                    fs.unlinkSync(file.path)
                } catch(err) {
                    console.error(err)
                }
            }))

            return await db.query(`
                DELETE FROM users
                WHERE id = $1
            `, [id])
        } catch(err) {
            console.error(err)
        }
    }
}