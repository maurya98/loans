"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dummy_data_seeder_1 = require("./dummy-data.seeder");
const logger_1 = require("../../utils/logger");
async function main() {
    const logger = new logger_1.Logger('SeederRunner');
    try {
        logger.info('Starting database seeding process...');
        const seeder = new dummy_data_seeder_1.DummyDataSeeder();
        await seeder.seed();
        logger.info('Database seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        logger.error('Failed to seed database:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=run-seeder.js.map