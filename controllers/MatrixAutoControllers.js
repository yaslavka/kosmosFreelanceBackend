const ApiError = require("../error/ApiError");
const jwt_decode = require("jwt-decode");
const { Op } = require("sequelize");
const {findParentId} = require('../service/findParentIdAuto')
const {checkCountParentId} = require('../service/checkCountParentIdAuto')
const marketingGift = require('../service/marketingGiftAuto')
const marketingCheckCount = require('../service/marketingCheckCountAuto')

const {
  CloneStatFive,
  User,
  TypeMatrixFive,
  MatrixFive,
  Matrix_TableFive,
} = require("../models/models");

const childNode = async (node, type_matrix_id) => {
  if (!node) {
    return null;
  }
  let matrix = await MatrixFive.findAll({
    where: { parent_id: node },
    include: {
      model: User,
      as: "user",
    },
  });
  return matrix;
};


const findRealUser = async (id, userId) => {
  const matrixSecondItem = await MatrixFive.findOne({ where: { id } });
  const matrixTableData = await Matrix_TableFive.findOne({
    where: { matrixFiveId: id },
  });
  if (matrixTableData) {
    const result = await Matrix_TableFive.findOne({
      where: {
        typeMatrixFiveId: matrixTableData.typeMatrixFiveId,
        userId: userId,
      },
    });
    return result;
  } else {
    return findRealUser(matrixSecondItem.parent_id, userId);
  }
};


class MatrixAutoController {
  async getCount(req, res, next) {
    const count = await CloneStatFive.findAll();
    return res.json({ items: count });
  }
  async clone(req, res, next) {
    const { matrix_type } = req.query;
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const { username } = jwt_decode(token);
    const user = await User.findOne({ where: { username } });
    const count = await Matrix_TableFive.findOne({
      where: { userId: user.id, typeMatrixFiveId: matrix_type },
    });
    if (count?.count) {
      return res.json({ count: count.count });
    } else {
      return res.json(null);
    }
  }
  async targetClone(req, res, next) {
    let { place, ancestor_id } = req.body;
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const { username } = jwt_decode(token);
    const user = await User.findOne({ where: { username } });
    const matrixTableData = await findRealUser(ancestor_id, user.id);
    if (matrixTableData.count < 1) {
      return next(ApiError.badRequest("Недостатосно count"));
    }
    let update = { count: matrixTableData.count - 1 };
    await Matrix_TableFive.update(update, {
      where: { id: matrixTableData.id },
    });
    const typeMatrix = (
      await Matrix_TableFive.findOne({ where: { id: matrixTableData.id } })
    ).typeMatrixFiveId;
    place = +place
    let side_matrix;
    let parent_id;
    switch (place) {
      case 1:
        side_matrix = 0;
        parent_id = ancestor_id;
        break;
      case 2:
        side_matrix = 1;
        parent_id = ancestor_id;
        break;
      case 3:
        side_matrix = 0;
        parent_id = (
          await MatrixFive.findOne({
            where: { parent_id: ancestor_id, side_matrix: 0 },
          })
        ).id;
        break;
      case 4:
        side_matrix = 1;
        parent_id = (
          await MatrixFive.findOne({
            where: { parent_id: ancestor_id, side_matrix: 0 },
          })
        ).id;
        break;
      case 5:
        side_matrix = 0;
        parent_id = (
          await MatrixFive.findOne({
            where: { parent_id: ancestor_id, side_matrix: 1 },
          })
        ).id;
        break;
      case 6:
        side_matrix = 1;
        parent_id = (
          await MatrixFive.findOne({
            where: { parent_id: ancestor_id, side_matrix: 1 },
          })
        ).id;
        break;
    }
    const matrixItem = MatrixFive.create({
      date: new Date(),
      parent_id: parent_id,
      userId: user.id,
      side_matrix,
    });

    const marketingCheck = await marketingCheckCount(parent_id);
    let marketingGiftResult = [];
    if (marketingCheck.length > 0) {
      marketingCheck.map(async (i) => {
        if (i.count) {
          marketingGiftResult.push(await marketingGift(
            i.count,
            i.parentId,
            typeMatrix
          ));
        }
      })

    }
    return res.json(marketingCheck);
  }
  async getType(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const { username } = jwt_decode(token);
    const user = await User.findOne({ where: { username } });
    const type = await Matrix_TableFive.findAll({
      where: { userId: user.id },
    });
    const typeMatrix = await TypeMatrixFive.findAll();

    let result = [];
    type.map((i, index) => {
      result.push({
        id: index + 1,
        count: i.count,
        name: typeMatrix[index].name,
        level: i.typeMatrixFiveId,
        canBuy: true,
        isActive: true,
        summ: typeMatrix[index].summ,
      });
    });
    for (let i = result.length + 1; i < 13; i++) {
      result.push({
        id: i,
        count: 0,
        name: typeMatrix[i - 1]?.name,
        level: i,
        canBuy: true,
        isActive: true,
        summ: typeMatrix[i - 1]?.summ,
      });
    }
    return res.json({ items: result });
  }
  async buy(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const { username } = jwt_decode(token);
    const { matrix_id } = req.body;
    const price = (await TypeMatrixFive.findOne({ where: { id: matrix_id } }))
      .summ;
    const user = await User.findOne({ where: { username } });
    if (+user.balance < (+price)) {
      return next(ApiError.badRequest("Недостатосно средств"));
    }
    let update = { balance: +user.balance - (+price) };
    await User.update(update, { where: { id: user.id } });
    let checkMatrixTable = await Matrix_TableFive.findOne({
      where: { userId: user.id, typeMatrixFiveId: matrix_id },
    });
    if (!checkMatrixTable) {
      const referalId = user.referal_id;
      let parentId, side_matrix;
      const parentIdForCheck = await findParentId(
        matrix_id,
        referalId,
        user.id
      );
      if (parentIdForCheck) {
        const resultFuncCheckCountParentId = await checkCountParentId(
          parentIdForCheck,
          user.id,
          matrix_id
        );
        parentId = resultFuncCheckCountParentId.parentId;
        side_matrix = resultFuncCheckCountParentId.side_matrix;
      } else {
        parentId = null;
        side_matrix = null;
      }

      const matrixItem = await MatrixFive.create({
        date: new Date(),
        parent_id: parentId,
        userId: user.id,
        side_matrix,
      });

      const matrixTableItem = await Matrix_TableFive.create({
        matrixFiveId: matrixItem.id,
        typeMatrixFiveId: matrix_id,
        userId: user.id,
        count: 0,
      });
      const marketingCheck = await marketingCheckCount(parentId);
      let marketingGiftResult = [];
      if (marketingCheck.length > 0) {
        marketingCheck.map(async (i) => {
          if (i.count) {
            marketingGiftResult.push(await marketingGift(
              i.count,
              i.parentId,
              matrix_id
            ));
          }
        })

        return res.json(marketingGiftResult);
      } else {
        return true 
      }
    } else {
      let updateTable = { count: checkMatrixTable.count + 1 };
      await Matrix_TableFive.update(updateTable, {
        where: { userId: user.id, typeMatrixFiveId: matrix_id },
      });
      return res.json(updateTable);
    }
  }
  async structureUpper(req, res, next) {
    const { matrix_id } = req.query;

    if (matrix_id) {
      const temp = await MatrixFive.findOne({ where: { id: matrix_id } });
      const rootUserId = await MatrixFive.findOne({ where: { id: temp.parent_id } });
      const rootUser = await User.findOne({ where: { id: rootUserId.userId } });
      const firstChildes = await childNode(rootUserId.id);
      let secondChildes;
      let thirdChildes;
      if (firstChildes && firstChildes[0]) {
        if (firstChildes[0].side_matrix === 0) {
          secondChildes = await childNode(firstChildes[0]?.id);
          thirdChildes = await childNode(firstChildes[1]?.id);
        } else {
          secondChildes = await childNode(firstChildes[1]?.id);
          thirdChildes = await childNode(firstChildes[0]?.id);
        }
      }
      // return res.json(firstChildes)
      let result = {
        0: {
          id: rootUserId.id,
          userName: rootUser.username,
          avatar: rootUser.avatar,
          typeId: null,
          place: 0,
          createdAt: rootUser.createdAt,
        },
      };
      if (firstChildes?.length > 0) {
        firstChildes.map((i, index) => {
          result[i.side_matrix + 1] = {
            id: firstChildes[index]?.id,
            userName: firstChildes[index]?.user.username,
            photo: firstChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: firstChildes[index]?.user.createdAt,
          };
        });
      }
      if (secondChildes?.length > 0) {
        secondChildes.map((i, index) => {
          result[i.side_matrix + 3] = {
            id: secondChildes[index]?.id,
            userName: secondChildes[index]?.user.username,
            photo: secondChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: secondChildes[index]?.user.createdAt,
          };
        });
      }
      if (thirdChildes?.length > 0) {
        thirdChildes.map((i, index) => {
          result[i.side_matrix + 5] = {
            id: thirdChildes[index]?.id,
            userName: thirdChildes[index]?.user.username,
            photo: thirdChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: thirdChildes[index]?.user.createdAt,
          };
        });
      }

      for (let i = 0; i < 7; i++) {
        if (!result[i]) {
          result[i] = null;
        }
      }

      return res.json({ items: result });
    }
  }

  async structure(req, res, next) {
    const { matrix_type, matrix_id } = req.query;

    if (matrix_id) {
      const rootUserId = await MatrixFive.findOne({
        where: { id: matrix_id },
      });
      const rootUser = await User.findOne({ where: { id: rootUserId.userId } });

      const firstChildes = await childNode(matrix_id);
      let secondChildes;
      let thirdChildes;
      if (firstChildes && firstChildes[0]) {
        if (firstChildes[0].side_matrix === 0) {
          secondChildes = await childNode(firstChildes[0]?.id);
          thirdChildes = await childNode(firstChildes[1]?.id);
        } else {
          secondChildes = await childNode(firstChildes[1]?.id);
          thirdChildes = await childNode(firstChildes[0]?.id);
        }
      }

      let result = {
        0: {
          id: matrix_id,
          userName: rootUser.username,
          photo: rootUser.avatar,
          typeId: null,
          place: 0,
          date: rootUser.createdAt,
        },
      };

      if (firstChildes?.length > 0) {
        firstChildes.map((i, index) => {
          result[i.side_matrix + 1] = {
            id: firstChildes[index]?.id,
            userName: firstChildes[index]?.user.username,
            photo: firstChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: firstChildes[index]?.user.createdAt,
          };
        });
      }
      if (secondChildes?.length > 0) {
        secondChildes.map((i, index) => {
          result[i.side_matrix + 3] = {
            id: secondChildes[index]?.id,
            userName: secondChildes[index]?.user.username,
            photo: secondChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: secondChildes[index]?.user.createdAt,
          };
        });
      }
      if (thirdChildes?.length > 0) {
        thirdChildes.map((i, index) => {
          result[i.side_matrix + 5] = {
            id: thirdChildes[index]?.id,
            userName: thirdChildes[index]?.user.username,
            photo: thirdChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: thirdChildes[index]?.user.createdAt,
          };
        });
      }

      for (let i = 0; i < 7; i++) {
        if (!result[i]) {
          result[i] = null;
        }
      }

      return res.json({ items: result });
    }

    if (matrix_type) {
      const { authorization } = req.headers;
      const token = authorization.slice(7);
      const { username } = jwt_decode(token);

      const user = await User.findOne({ where: { username } });
      const dataMatrixTable = await Matrix_TableFive.findOne({
        where: { userId: user?.id, typeMatrixFiveId: matrix_type },
      });
      if (!dataMatrixTable) {
        let result = {};
        for (let i = 0; i < 7; i++) {
          if (!result[i]) {
            result[i] = null;
          }
        }
        return res.json({ items: result });
      }
      const root_matrix_tables = await MatrixFive.findOne({
        where: { id: dataMatrixTable?.matrixFiveId },
        include: { model: User, as: "user" },
      });

      let result = {
        0: {
          id: root_matrix_tables.id,
          userName: root_matrix_tables.user.username,
          photo: root_matrix_tables.user.avatar,
          typeId: null,
          place: 0,
          createdAt: root_matrix_tables.createdAt,
        },
      };
      let firstChildes = await childNode(root_matrix_tables.id);
      let secondChildes;
      let thirdChildes;
      if (firstChildes && firstChildes[0]) {
        if (firstChildes[0].side_matrix === 0) {
          secondChildes = await childNode(firstChildes[0]?.id);
          thirdChildes = await childNode(firstChildes[1]?.id);
        } else {
          secondChildes = await childNode(firstChildes[1]?.id);
          thirdChildes = await childNode(firstChildes[0]?.id);
        }
      }
      if (firstChildes?.length > 0) {
        firstChildes.map((i, index) => {
          result[i.side_matrix + 1] = {
            id: firstChildes[index]?.id,
            userName: firstChildes[index]?.user.username,
            photo: firstChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: firstChildes[index]?.user.createdAt,
          };
        });
      }
      if (secondChildes?.length > 0) {
        secondChildes.map((i, index) => {
          result[i.side_matrix + 3] = {
            id: secondChildes[index]?.id,
            userName: secondChildes[index]?.user.username,
            photo: secondChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: secondChildes[index]?.user.createdAt,
          };
        });
      }
      if (thirdChildes?.length > 0) {
        thirdChildes.map((i, index) => {
          result[i.side_matrix + 5] = {
            id: thirdChildes[index]?.id,
            userName: thirdChildes[index]?.user.username,
            photo: thirdChildes[index]?.user.avatar,
            typeId: null,
            place: 0,
            createdAt: thirdChildes[index]?.user.createdAt,
          };
        });
      }

      for (let i = 0; i < 7; i++) {
        if (!result[i]) {
          result[i] = null;
        }
      }
      return res.json({ items: result });
    }
  }
}

module.exports = new MatrixAutoController();