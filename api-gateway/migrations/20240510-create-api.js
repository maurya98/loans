"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('apis', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      version: { type: Sequelize.STRING, allowNull: false },
      basePath: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      defaultVersion: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      rateLimit: { type: Sequelize.INTEGER },
      rateLimitWindow: { type: Sequelize.INTEGER },
      composition: { type: Sequelize.JSONB },
      mockEnabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      mockResponse: { type: Sequelize.TEXT },
      lifecycleStatus: { type: Sequelize.STRING, allowNull: false, defaultValue: 'draft' },
      deprecationDate: { type: Sequelize.DATE },
      retirementDate: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('apis');
  }
}; 