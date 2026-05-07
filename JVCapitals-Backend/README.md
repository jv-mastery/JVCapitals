# JVCapitals Backend API

A scalable PostgreSQL backend for the JVCapitals platform built with Node.js and Express.

## Features

- **User Authentication**: JWT-based authentication with session management
- **3NF Database Schema**: Normalized PostgreSQL database for scalability
- **RESTful API**: Clean API endpoints for all frontend operations
- **Security**: Rate limiting, CORS, helmet, input validation
- **Asset Management**: Track cryptocurrency and traditional assets
- **Wallet Management**: Multi-wallet support with balance tracking
- **Word Storage**: User's personal word/phrase collection with tags
- **Portfolio Tracking**: Real-time portfolio valuation and analytics

## Database Schema (3NF Normalized)

The database is designed in Third Normal Form for optimal scalability:

- **users**: Core user information
- **user_profiles**: Extended user details (separated for 3NF)
- **user_settings**: User preferences
- **wallets**: User cryptocurrency wallets
- **assets**: User assets with price tracking
- **asset_types**: Reference table for asset categories
- **words**: User's saved words/phrases with tags
- **transactions**: Asset transaction history
- **user_sessions**: Authentication session management
- **audit_logs**: Action tracking for security

## Local Development Setup

### Prerequisites

**Required Software:**
- **Node.js** 18+ - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** 14+ - [Download PostgreSQL](https://www.postgresql.org/download/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download Git](https://git-scm.com/)

**Optional Tools:**
- **PostgreSQL Client** (pgAdmin, DBeaver, or psql)
- **VS Code** with recommended extensions
- **Postman** or **Insomnia** for API testing

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
# Clone the backend repository
git clone <repository-url>
cd JVCapitals-Backend

# Verify you're in the correct directory
pwd
# Should show: .../JVCapitals/JVCapitals-Backend
```

#### 2. Install Dependencies

```bash
# Install all Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected Dependencies:**
- express - Web framework
- pg - PostgreSQL client
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin resource sharing
- helmet - Security middleware
- joi - Input validation
- dotenv - Environment variables

#### 3. Set Up PostgreSQL Database

**Option A: Using psql (Command Line)**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jvcapitals;

# Create user (optional, you can use existing postgres user)
CREATE USER jvcapitals_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jvcapitals TO jvcapitals_user;

# Exit psql
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `jvcapitals`
5. Click "Save"

#### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

**Environment Configuration (.env):**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jvcapitals
DB_USER=postgres  # or your created user
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional: API Keys for external services
# COINGECKO_API_KEY=your_api_key_here
# ETHERSCAN_API_KEY=your_api_key_here
```

**Important Notes:**
- `JWT_SECRET` must be at least 32 characters long
- Keep your `.env` file secure and never commit it to version control
- Use different secrets for development and production

#### 5. Run Database Migration

```bash
# Run the complete database migration
npm run migrate

# Alternative: Run the migration script directly
node scripts/migrate-all.js
```

**Migration Creates:**
- Complete database schema with UUID primary keys
- All necessary tables (users, wallets, assets, etc.)
- Proper indexes for performance
- Default data (asset types, transaction types)
- Balance fields (initial_balance, interest_earned, total_balance)

**Verify Migration:**
```bash
# Connect to your database and verify tables
psql -U postgres -d jvcapitals

# List all tables
\dt

# Should show tables like:
# users, user_profiles, user_settings, wallets, assets, etc.

# Exit psql
\q
```

#### 6. Start the Development Server

```bash
# Start the development server with auto-reload
npm run dev

# Alternative: Start without auto-reload
npm start
```

**Expected Output:**
```
🚀 JVCapitals Backend API Server
📡 Server running on: http://localhost:3000
🗄️  Database connected: PostgreSQL
🔐 JWT authentication enabled
📝 Environment: development
🔄 Auto-reload enabled (nodemon)
```

#### 7. Verify Server is Running

```bash
# Test the server health endpoint
curl http://localhost:3000/api

# Expected response:
# {"message": "JVCapitals Backend API Server"}

# Test database connection
curl http://localhost:3000/api/health

# Expected response:
# {"status": "healthy", "database": "connected"}
```

### Troubleshooting Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or change port in .env
PORT=3001
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Test database connection manually
psql -U postgres -d jvcapitals

# Common fixes:
# 1. Verify PostgreSQL service is running
# 2. Check database credentials in .env
# 3. Ensure database exists
# 4. Check firewall settings
```

#### Migration Errors
```bash
# Reset database (WARNING: This deletes all data)
psql -U postgres -d jvcapitals -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
npm run migrate
```

#### Permission Issues
```bash
# On macOS/Linux, fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx instead of global npm
npx nodemon server.js
```

### Development Workflow

#### Daily Development
```bash
# 1. Start PostgreSQL (if not running)
# On macOS with Homebrew: brew services start postgresql
# On Windows: Start PostgreSQL service

# 2. Start backend server
npm run dev

# 3. Make changes to code (auto-reload will restart server)

# 4. Test API endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

#### Database Changes
```bash
# 1. Modify schema_complete.sql
# 2. Reset and re-migrate database
npm run reset-db
npm run migrate

# 3. Restart server (nodemon should auto-restart)
```

#### Testing API Endpoints
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123","adminCode":"ADMIN123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Save the token for subsequent requests
export TOKEN="your_jwt_token_here"

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users/wallets
```

### Project Structure

```
JVCapitals-Backend/
├── config/
│   ├── db.js              # Database connection
│   └── auth.js            # JWT configuration
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── validation.js       # Input validation
├── models/
│   ├── User.js            # User model
│   ├── Wallet.js          # Wallet model
│   ├── Asset.js           # Asset model
│   └── Word.js            # Word model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── seedPhrase.js      # Seed phrase & wallet routes
│   └── assets.js          # Asset management routes
├── services/
│   ├── priceService.js    # Price fetching service
│   └── apiService.js      # External API service
├── scripts/
│   ├── migrate-all.js     # Database migration
│   └── reset-database.js  # Database reset
├── database/
│   └── schema_complete.sql # Complete database schema
├── .env.example           # Environment template
├── .env                   # Your environment config (don't commit)
├── package.json           # Dependencies and scripts
├── server.js              # Main server file
└── README.md              # This file
```

### Next Steps

After successful setup:

1. **Test the API** - Use Postman or curl to test endpoints
2. **Set up Frontend** - Configure frontend to connect to `http://localhost:3000`
3. **Create Admin User** - Use the admin code to create the first admin account
4. **Import Test Data** - Add sample data for testing
5. **Review Security** - Ensure JWT secrets are strong and environment is secure

### Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting-common-issues) section
2. Review the server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL is running and accessible
5. Check that all dependencies are installed correctly

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/settings` - Update user settings

### User Management
- `GET /api/users/wallets` - Get user's wallets
- `POST /api/users/wallets` - Create new wallet
- `GET /api/users/wallets/:id` - Get wallet details
- `PUT /api/users/wallets/:id/balance` - Update wallet balance

- `GET /api/users/assets` - Get user's assets
- `POST /api/users/assets` - Create new asset
- `GET /api/users/asset-types` - Get asset types
- `GET /api/users/portfolio-summary` - Get portfolio summary

- `GET /api/users/words` - Get user's words
- `POST /api/users/words` - Create new word
- `GET /api/users/words/search` - Search words
- `GET /api/users/words/categories` - Get word categories
- `GET /api/users/words/tags` - Get word tags
- `GET /api/users/words/stats` - Get word statistics
- `PUT /api/users/words/:id/favorite` - Toggle word favorite
- `PUT /api/users/words/:id` - Update word
- `DELETE /api/users/words/:id` - Delete word

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jvcapitals
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **Input Validation**: Joi schema validation
- **Session Management**: Secure session tracking

## Database Features

- **Indexes**: Optimized for performance
- **Triggers**: Automatic timestamp updates
- **Constraints**: Data integrity enforcement
- **Transactions**: ACID compliance
- **Full-text Search**: PostgreSQL text search for words

## Development

### Running Tests
```bash
npm test
```

### Database Migration
```bash
npm run migrate
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## Frontend Integration

The frontend should:

1. Store JWT token in localStorage/httpOnly cookies
2. Include token in Authorization header: `Bearer <token>`
3. Handle 401 responses by redirecting to login
4. Implement proper error handling
5. Use the API endpoints as defined above

## Migration from localStorage

To migrate your existing React frontend:

1. Replace localStorage auth calls with `/api/auth` endpoints
2. Replace localStorage user data with `/api/users` endpoints
3. Update AuthContext to use API calls instead of localStorage
4. Implement proper error handling and loading states

## License

MIT License - see LICENSE file for details.
