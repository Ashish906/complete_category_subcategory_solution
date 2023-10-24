const { Op } = require('sequelize')

const { AsyncHandler, CustomError } = require('../utils')
const { sequelize } = require('../../config/db')
const { categoryHelper } = require('../helpers')
const { categoryService } = require('../services')

exports.createACategory = AsyncHandler(async (req, res, next) => {
    await sequelize.transaction(async (transaction) => {
        const { name, parent_id } = req.body

        const categoryCreationData = { name }

        if (parent_id) {
            const parentCategory = await categoryHelper.getACategory({ where: { id: parent_id } })
            if (!parentCategory) throw new CustomError(404, 'Parent category not found')
            categoryCreationData.lft = parentCategory.rgt
            categoryCreationData.rgt = parentCategory.rgt + 1
            categoryCreationData.parent_id = parent_id
        } else {
            const maxRgtCategory = await categoryHelper.getACategory({ where: { parent_id: null }, order: [['rgt', 'desc']] })
            categoryCreationData.lft = (maxRgtCategory?.rgt || 0) + 1
            categoryCreationData.rgt = (maxRgtCategory?.rgt || 0) + 2
        }
        const category = await categoryService.createACategory(categoryCreationData, transaction)

        // To update other categories
        await categoryService.incrementCategoryValues(
            {
                where: { lft: { [Op.gt]: category.lft } },
                field: 'lft',
                by: 2
            }, transaction)

        await categoryService.incrementCategoryValues(
            {
                where: { rgt: { [Op.gte]: category.lft }, id: { [Op.ne]: category.id } },
                field: 'rgt',
                by: 2
            }, transaction)

        res.status(201).json({
            success: true,
            data: category
        })
    })

})

exports.getCategoryChart = AsyncHandler(async (req, res, next) => {
    const categories = await sequelize.query(
        `select node.id, concat(node.name) as name, count(parent.id) as depth
        from categories as node, categories as parent
        where node.lft between parent.lft and parent.rgt
        group by node.id
        order by node.lft asc
        `,
        {
            raw: true,
            nest: true
        }
    );
    // const result = []
    // for (let i = 0; i < categories.length; i++) {
    //     const category = categories[i]
    //     if (category.depth < current.depth) {
    //         for (let j = category.depth; j < current.depth; j++) {
    //             parent = parent.parent
    //         }
    //     } else if (category.depth > current.depth) {
    //         for (let j = current.depth; j < category.depth; j++) {
    //             parent = current
    //         }
    //     }
    //     category.parent = parent
    //     category.children = []
    //     if(parent) parent.children.push(category)
    //     else {
    //         result.push(category)
    //     }
    //     console.log({ category })
    //     current = category
    // }
    // console.log('I am here')
    res.status(200).json({
        success: true,
        data: result
    })
})