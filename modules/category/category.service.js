const { CategoryModel } = require('../models')

exports.createACategory = async (data, transaction) => await CategoryModel.create(data, { transaction })

exports.updateCategories = async (where, data, transaction) => await CategoryModel.update(data, { returning: true, transaction, where })

exports.incrementCategoryValues = async (params = {}, transaction) => {
    const { where, field, by } = params
    return await CategoryModel.increment(field, { by, transaction, where })
}
