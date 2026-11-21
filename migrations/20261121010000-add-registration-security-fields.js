'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone_normalized', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('users', 'registration_ip', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'registration_country', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'registration_country');
    await queryInterface.removeColumn('users', 'registration_ip');
    await queryInterface.removeColumn('users', 'phone_normalized');
  },
};
