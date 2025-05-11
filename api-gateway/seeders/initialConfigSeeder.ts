import { sequelize } from '../src/models';
import User from '../src/models/User';
import API from '../src/models/API';
import APIKey from '../src/models/APIKey';
import bcrypt from 'bcryptjs';

async function seed() {
  await sequelize.sync({ force: false });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const [admin, created] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create a sample API
  const [api] = await API.findOrCreate({
    where: { name: 'Sample API', version: '1' },
    defaults: {
      name: 'Sample API',
      version: '1',
      basePath: '/sample',
      defaultVersion: true,
      lifecycleStatus: 'published',
      rateLimit: 100,
      rateLimitWindow: 60,
    },
  });

  // Create an API key for the admin
  await APIKey.findOrCreate({
    where: { userId: admin.id, apiId: api.id },
    defaults: {
      key: 'admin-initial-key',
      userId: admin.id,
      apiId: api.id,
      status: 'active',
    },
  });

  console.log('Initial configuration seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
}); 