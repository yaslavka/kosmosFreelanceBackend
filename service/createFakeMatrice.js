const {
    MatrixSix,
    Matrix_TableSix,
} = require("../models/models");
const checkForLevel = require("./checkForLevels");

module.exports = async ()=>{
    const level = await Matrix_TableSix.min('typeMatrixSixId')
    const matrixTemp = await MatrixSix.findAll({ include: { model: Matrix_TableSix, as: "matrix_table" } })
    const matrix = matrixTemp.filter((i, index) => {
        return ((i.matrix_table[0]?.typeMatrixId === level) && (i.matrix_table[0]?.count > 6))

    })
    const parentId = matrix[0]?.id
    const matrixItem = await MatrixSix.create({
        date: new Date,
        parent_id: parentId,
        userId: 1,
        matrix_essence: 11
    })

    await checkForLevel(parentId, level)
}        
 