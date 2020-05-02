const db = require('../../config/db')
const { hash } = require('bcryptjs')

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

            return (await db.query(query, values)).rows[0].id
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

            return (await db.query(query)).rows[0]
        } catch(err) {
            console.error(err)
        }
    }
}