const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/db')

const CategoryModel = sequelize.define('categories', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    parent_id: {
        type: DataTypes.UUID
    },
    lft: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    rgt: {
        allowNull: false,
        type: DataTypes.INTEGER
    }
}, {
    timestamps: true
})

module.exports = { CategoryModel }