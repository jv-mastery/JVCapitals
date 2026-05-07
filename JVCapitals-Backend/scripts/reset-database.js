import { query } from '../config/db.js';

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data in your database!');
    console.log('🔄 Starting database reset...');
    
    // Disable foreign key constraints temporarily
    await query('SET session_replication_role = replica;');
    
    // Drop all tables in correct order to respect foreign key constraints
    const tables = [
      'audit_logs',
      'transactions',
      'words',
      'assets',
      'wallets',
      'user_sessions',
      'user_settings',
      'user_profiles',
      'users',
      'transaction_types',
      'asset_types'
    ];
    
    for (const table of tables) {
      try {
        await query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Warning: Could not drop table ${table}:`, error.message);
      }
    }
    
    // Re-enable foreign key constraints
    await query('SET session_replication_role = DEFAULT;');
    
    console.log('🗑️  Database reset completed!');
    console.log('📝 Run migration script to recreate tables:');
    console.log('   node scripts/migrate.js');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Run reset if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase();
}

export default resetDatabase;
