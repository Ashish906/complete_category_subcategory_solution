const category = require('./category/category.route')

module.exports = (app) => {
    app.use('/category', category)
}