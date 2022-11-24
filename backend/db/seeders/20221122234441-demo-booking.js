'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
     {
      spotId: 1,
      userId: 1,
      startDate: 2025-11-24,
      endDate: 2025-11-25
     },
     {
      spotId: 2,
      userId: 2,
      startDate: 2025-12-24,
      endDate: 2025-12-25
     },
    {
      spotId: 3,
      userId: 3,
      startDate: 2026-11-24,
      endDate: 2026-11-25
    }
    ], {});
   },

   async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: ["1", "2", "3"] }
    }, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
