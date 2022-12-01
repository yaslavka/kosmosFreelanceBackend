const {
     MatrixFour,
  } = require("../models/models");

const checkCountParentId = async (parentId, userId, typeMatrixSecondId) => {
  const itemsParentId = await MatrixFour.findAll({
    where: { parent_id: parentId },
  });
  if (itemsParentId.length > 2) {
    // const leftItem = itemsParentId[0].userId;
    // const rightItem = itemsParentId[1].userId;
    let one = await checkCountParentId(itemsParentId[0].id, userId);
    let two = await checkCountParentId(itemsParentId[1].id, userId);
    let th = await checkCountParentId(itemsParentId[2].id, userId);
    let countOne = await MatrixFour.count({
      where: { parent_id: one.parentId },
    });
    let countTwo = await MatrixFour.count({
      where: { parent_id: two.parentId },
    });
    let countThr = await MatrixFour.count({
      where: { parent_id: th.parentId },
    });
    if (countOne > countThr) {
      return one;
    } else if (countOne < countTwo) {
      return two;
    }else if (countTwo < countThr){
      return th
    }else {
      if (one.parentId < th.parentId) {
        return one;
      } else {
       if (two.parentId < th.parentId){
         return th
       }
      }
    }
  } else if (itemsParentId.length > 0) {
    return { parentId, side_matrix: 1 };
  } else if (itemsParentId.length > 1){
    return { parentId, side_matrix: 2 };
  }else {
    return { parentId, side_matrix: 0 };
  }
};
  module.exports = {checkCountParentId}