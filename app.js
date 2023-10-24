const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const errorHandler = require('./middleware/errorHandler')

dotenv.config({
    path: './config/.env'
})

require('./config/db')
const bindRoutes = require('./modules/routes')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
bindRoutes(app)
app.use(errorHandler)
app.listen(process.env.PORT, 'localhost', () => console.log('App running on port: ', process.env.PORT))

module.exports = app