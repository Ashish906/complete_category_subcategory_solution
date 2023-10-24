const { sequelize } = require('../../config/db')
const { CategoryModel } = require('../models')

exports.getACategory = async (params = {}, transaction) => {
    const { attributes, include, order, where } = params

    return await CategoryModel.findOne({
        attributes,
        include,
        order,
        where
    })
}

exports.getCategories = async(params = {}, transaction) => {
    const { attributes, group, include, order, where } = params

    return await CategoryModel.findAll({
        attributes,
        group,
        include,
        order,
        where
    })
}