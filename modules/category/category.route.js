const router = require('express').Router()
const { createACategory, getCategoryChart } = require('./category.controller')

router.post('/',createACategory)
router.get('/',getCategoryChart)

module.exports = router