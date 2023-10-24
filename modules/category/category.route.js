const router = require('express').Router()
const { createACategory, getCategoryChart, deleteCategory } = require('./category.controller')

router.delete('/',deleteCategory)
router.post('/',createACategory)
router.get('/',getCategoryChart)

module.exports = router