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
    )

    const result = []
    if (categories.length) {
        result.push(categories[0])

        categories[0].children = []
        let previous = categories[0]
        let parent = null
        const parentObj = {}
        for (let i = 1; i < categories.length; i++) {
            const category = categories[i]

            const preDepth = previous.depth
            if (category.depth < preDepth) {
                for (let j = category.depth; j <= preDepth; j++) {
                    parent = parentObj[previous.id]
                    previous = parent
                }
            } else if (category.depth > preDepth) {
                parent = previous
            }
            category.children = []
            if (parent) parent.children.push(category)
            else {
                result.push(category)
            }
            previous = category
            parentObj[category.id] = parent
        }
    }

    res.status(200).json({
        success: true,
        data: result
    })
})

exports.deleteCategory = AsyncHandler(async (req, res, next) => {
    const { id } = req.body
    await sequelize.transaction(async (transaction) => {
        const category = await categoryHelper.getACategory({ where: { id } })
        if (!category) throw new CustomError(404, 'Category not found')

        const deleteCount = await categoryService.deleteACategory({ id }, transaction)
        if (deleteCount) {
            // To update other categories
            await categoryService.incrementCategoryValues(
                {
                    where: { lft: { [Op.gt]: category.lft } },
                    field: 'lft',
                    by: -2
                }, transaction)

            await categoryService.incrementCategoryValues(
                {
                    where: { rgt: { [Op.gte]: category.lft }, id: { [Op.ne]: category.id } },
                    field: 'rgt',
                    by: -2
                }, transaction)
        }

        res.status(200).json({
            success: true
        })
    })
})