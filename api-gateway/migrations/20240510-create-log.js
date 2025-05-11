"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      apiId: { type: Sequelize.INTEGER, allowNull: false },
      userId: { type: Sequelize.INTEGER },
      method: { type: Sequelize.STRING, allowNull: false },
      path: { type: Sequelize.STRING, allowNull: false },
      statusCode: { type: Sequelize.INTEGER, allowNull: false },
      request: { type: Sequelize.TEXT, allowNull: false },
      response: { type: Sequelize.TEXT, allowNull: false },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      latencyMs: { type: Sequelize.INTEGER },
      error: { type: Sequelize.TEXT }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('logs');
  }
}; 