const ApiError = require("../error/ApiError");
const jwt_decode = require("jwt-decode");
const {BalanceCrypto} = require("../models/TablesExchange/tableBalanceCrypto");
const {Wallet} = require("../models/TablesExchange/tableWallet");
const { findParentId } = require("../service/findParentIdPegasMini");
const {
    checkCountParentId,
} = require("../service/checkCoountParentIdPegasMini");

const {
    CloneStatFour,
    User,
    Matrix_TableFour,
    TypeMatrixFour,
    MatrixFour,
} = require("../models/models");

const marketingPegasUnoCheck = async (parent_id) => {
    if (!parent_id) {
        return false;
    }
    const countNode = await MatrixFour.count({ where: { parent_id } });
    if (countNode == 3) {
        return true;
    } else {
        return false;
    }
};

const giftReferalUser = async (referalId, summ) => {
    const checkMatrixReferal = await MatrixFour.findOne({
        where: { userId: referalId },
    });
    if (checkMatrixReferal) {
        const referalUser = await User.findOne({ where: { id: referalId } });
        const walletRUBId = await Wallet.findOne({where:{name: 'RUR'}})
        const walletRUBBalance = await BalanceCrypto.findOne({
            where: {
                userId: referalUser.id,
                walletId: walletRUBId.id
            }
        })
        let updateBalance = { balance: (+walletRUBBalance.balance) + (+summ) };
        await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
    }
};

const transitionToHighLevel = async (matrixId, level, user) => {
    let nextLevel = level + 1;
    const referalId = user.referal_id;
    let parentId, side_matrix;
    const parentIdForCheck = await findParentId(nextLevel, referalId, user.id);
    if (parentIdForCheck) {
        const resultFuncCheckCountParentId = await checkCountParentId(
            parentIdForCheck,
            user.id,
            nextLevel
        );
        parentId = resultFuncCheckCountParentId.parentId;
        side_matrix = resultFuncCheckCountParentId.side_matrix;
    } else {
        parentId = null;
        side_matrix = null;
    }

    const matrixItem = await MatrixFour.create({
        date: new Date(),
        parent_id: parentId,
        userId: user.id,
        side_matrix,
    });

    const matrixTableItem = await Matrix_TableFour.create({
        matrixFourId: matrixItem.id,
        typeMatrixFourId: nextLevel,
        userId: user.id,
        count: 0,
    });
    const marketingCheck = await marketingPegasUnoCheck(parentId);
    if (marketingCheck) {
        const gift = await marketingGift(parentId, nextLevel);
    }
};

const marketingGift = async (parentId, type_matrix_id) => {
    const matrixItemThree = await MatrixFour.findOne({
        where: { id: parentId },
    });
    const user = await User.findOne({ where: { id: matrixItemThree.userId } });
    let updateBalance;
    const walletRUBId = await Wallet.findOne({where:{name: 'RUR'}})
    const walletRUBBalance = await BalanceCrypto.findOne({
        where: {
            userId: user.id,
            walletId: walletRUBId.id
        }
    })
    switch (type_matrix_id) {
        case 1:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 2:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 1000 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 3:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 1500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 4:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 2000 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 5:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 2500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 6:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 3500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 7:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 3500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            await giftReferalUser(user.referal_id, 100);
            break;
        case 8:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 4000 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            break;
        case 9:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 4500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            await giftReferalUser(user.referal_id, 1000);
            break;
        case 10:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 5000 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            await giftReferalUser(user.referal_id, 2000);
            break;
        case 11:
            await transitionToHighLevel(parentId, type_matrix_id, user);
            updateBalance = { balance: (+walletRUBBalance.balance) + 5500 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            await giftReferalUser(user.referal_id, 7000);
            break;
        case 12:
            updateBalance = { balance: (+walletRUBBalance.balance) + 6000 };
            await BalanceCrypto.update(updateBalance, { where: { id: walletRUBBalance.id } });
            await giftReferalUser(user.referal_id, 20000);
            break;

        default:
            break;
    }
};

const childNode = async (node, type_matrix_id) => {
    if (!node) {
        return null;
    }
    let matrix = await MatrixFour.findAll({
        where: { parent_id: node },
        include: {
            model: User,
            as: "user",
        },
    });
    return matrix;
};

const findRealUser = async (id, userId) => {
    const matrixThirdItem = await MatrixFour.findOne({ where: { id } });
    const matrixTableData = await Matrix_TableFour.findOne({
        where: { matrixFourId: id },
    });
    if (matrixTableData) {
        const result = await Matrix_TableFour.findOne({
            where: {
                typeMatrixFourId: matrixTableData.typeMatrixFourId,
                userId: userId,
            },
        });
        return result;
    } else {
        return findRealUser(matrixThirdItem.parent_id, userId);
    }
};

class MiniControllers {
    async getCloneStat(req, res, next) {
        const count = await CloneStatFour.findAll();
        return res.json({ items: count });
    }
    async buy(req, res, next) {
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const { username } = jwt_decode(token);
        const { matrix_id } = req.body;
        const price = (await TypeMatrixFour.findOne({ where: { id: matrix_id } }))
            .summ;
        const user = await User.findOne({ where: { username } });
        const walletRUBId = await Wallet.findOne({where:{name: 'RUR'}})
        const walletRUBBalance = await BalanceCrypto.findOne({
            where: {
                userId: user.id,
                walletId: walletRUBId.id
            }
        })
        if ((+walletRUBBalance.balance < price) && (user.locale < price)) {
            return next(ApiError.badRequest("Недостатосно средств"));
        } else if (+walletRUBBalance.balance >= price){
            let update = { balance: (+walletRUBBalance.balance) - (+price) };
            await BalanceCrypto.update(update, { where: { id: walletRUBBalance.id } });
        } else {
            let update = { locale: (+user.locale) - (+price)} ;
            await User.update(update, { where: { id: user.id } });
        }
        let checkMatrixTable = await Matrix_TableFour.findOne({
            where: { userId: user.id, typeMatrixFourId: matrix_id },
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

            const matrixItem = await MatrixFour.create({
                date: new Date(),
                parent_id: parentId,
                userId: user.id,
                side_matrix,
            });

            const matrixTableItem = await Matrix_TableFour.create({
                matrixFourId: matrixItem.id,
                typeMatrixFourId: matrix_id,
                userId: user.id,
                count: 0,
            });
            const marketingCheck = await marketingPegasUnoCheck(parentId);
            if (marketingCheck) {
                const gift = await marketingGift(parentId, matrix_id);
            }
            return res.json(true);
        } else {
            return next(ApiError.badRequest("Вы больше не можете купить"));
        }
    }
    async structure(req, res, next) {
        const { matrix_type, matrix_id } = req.query;

        if (matrix_id) {
            const rootUserId = await MatrixFour.findOne({
                where: { id: matrix_id },
            });
            const rootUser = await User.findOne({ where: { id: rootUserId.userId } });

            const firstChildes = await childNode(matrix_id);

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
            if (firstChildes?.length > 1) {
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
            for (let i = 0; i < 4; i++) {
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
            const dataMatrixTable = await Matrix_TableFour.findOne({
                where: { userId: user?.id, typeMatrixFourId: matrix_type },
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
            const root_matrix_tables = await MatrixFour.findOne({
                where: { id: dataMatrixTable?.matrixFourId },
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
            if (firstChildes?.length > 1) {
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

            for (let i = 0; i < 4; i++) {
                if (!result[i]) {
                    result[i] = null;
                }
            }
            return res.json({ items: result });
        }
    }
    async structureUpper(req, res, next) {
        const { matrix_id } = req.query;

        if (matrix_id) {
            const temp = await MatrixFour.findOne({ where: { id: matrix_id } });
            const rootUserId = await MatrixFour.findOne({
                where: { id: temp.parent_id },
            });
            const rootUser = await User.findOne({ where: { id: rootUserId.userId } });
            const firstChildes = await childNode(rootUserId.id);

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
            if (firstChildes?.length > 1) {
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

            for (let i = 0; i < 4; i++) {
                if (!result[i]) {
                    result[i] = null;
                }
            }

            return res.json({ items: result });
        }
    }
    async getType(req, res, next) {
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const { username } = jwt_decode(token);
        const user = await User.findOne({ where: { username } });
        const type = await Matrix_TableFour.findAll({
            where: { userId: user.id },
        });
        const typeMatrix = await TypeMatrixFour.findAll();

        let result = [];
        type.map((i, index) => {
            result.push({
                id: index + 1,
                count: i.count,
                name: typeMatrix[index].name,
                level: i.typeMatrixFourId,
                canBuy: true,
                isActive: true,
                summ: typeMatrix[index].summ,
            });
        });
        for (let i = result.length + 1; i < 13; i++) {
            result.push({
                id: i,
                count: 0,
                name: typeMatrix[i - 1].name,
                level: i,
                canBuy: true,
                isActive: true,
                summ: typeMatrix[i - 1].summ,
            });
        }
        return res.json({ items: result });
    }
}

module.exports = new MiniControllers();
