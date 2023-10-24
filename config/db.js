const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres'
})

;( async () => {
    sequelize.authenticate().then(() => console.log('Database connected successfully')).catch(err => console.log('Database connection error: ', err))
    // await sequelize.sync({ alter: true })
})()

module.exports = { sequelize }