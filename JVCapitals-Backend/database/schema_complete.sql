-- JVCapitals Complete Database Schema
-- This schema includes UUID primary keys and balance fields in one file
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table - Core user information with UUID and balance fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    initial_balance DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    interest_earned DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    total_balance DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- User profiles table - Extended user information (separated for 3NF)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    avatar_url VARCHAR(500),
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Wallets table - User cryptocurrency wallets with seed phrase support
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    -- 'bitcoin', 'ethereum', 'polygon', 'litecoin', 'binance', etc.
    chain_name VARCHAR(100),
    -- Human-readable chain name: 'Bitcoin', 'Ethereum', 'Polygon', etc.
    symbol VARCHAR(20),
    -- Chain symbol: 'BTC', 'ETH', 'MATIC', etc.
    balance DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    private_key TEXT,
    -- Encrypted private key for wallet operations
    public_key TEXT,
    -- Public key for verification
    derivation_path TEXT,
    -- BIP44 derivation path: "m/44'/0'/0'/0"
    account_index INTEGER DEFAULT 0,
    -- Account index for HD wallet derivation
    seed_phrase_hash VARCHAR(255),
    -- Hash of the seed phrase used to derive this wallet
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Asset types table - Reference table for asset categories
CREATE TABLE asset_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Assets table - User assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_type_id UUID REFERENCES asset_types(id),
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20),
    quantity DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    purchase_price DECIMAL(36, 18),
    current_price DECIMAL(36, 18),
    wallet_id UUID REFERENCES wallets(id) ON DELETE
    SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Words table - User's saved words/phrases
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT [],
    -- PostgreSQL array for tags
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- User sessions table - For authentication and session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Transaction types table - Reference table for transaction categories
CREATE TABLE transaction_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Transactions table - Asset transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    transaction_type_id UUID REFERENCES transaction_types(id),
    quantity DECIMAL(36, 18) NOT NULL,
    price_per_unit DECIMAL(36, 18) NOT NULL,
    total_amount DECIMAL(36, 18) NOT NULL,
    fee DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    transaction_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'completed', 'failed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- User settings table - User preferences
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Audit logs table - For tracking user actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_initial_balance ON users(initial_balance);
CREATE INDEX idx_users_interest_earned ON users(interest_earned);
CREATE INDEX idx_users_total_balance ON users(total_balance);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);
CREATE INDEX idx_wallets_type ON wallets(wallet_type);
CREATE INDEX idx_wallets_chain_name ON wallets(chain_name);
CREATE INDEX idx_wallets_symbol ON wallets(symbol);
CREATE INDEX idx_wallets_seed_phrase_hash ON wallets(seed_phrase_hash);
CREATE INDEX idx_wallets_user_active ON wallets(user_id, is_active);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type_id ON assets(asset_type_id);
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_content ON words USING gin(to_tsvector('english', content));
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Trigger function to automatically calculate total_balance
CREATE OR REPLACE FUNCTION calculate_total_balance() RETURNS TRIGGER AS $$ BEGIN -- Calculate total_balance as initial_balance + interest_earned
    -- Note: Wallet balances are added at the application level in User model
    NEW.total_balance = COALESCE(NEW.initial_balance, 0) + COALESCE(NEW.interest_earned, 0);
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER calculate_users_total_balance BEFORE
INSERT
    OR
UPDATE OF initial_balance,
    interest_earned ON users FOR EACH ROW EXECUTE FUNCTION calculate_total_balance();
CREATE TRIGGER update_user_profiles_updated_at BEFORE
UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE
UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE
UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_words_updated_at BEFORE
UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE
UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert default reference data
INSERT INTO asset_types (name, description)
VALUES ('Bitcoin', 'Bitcoin cryptocurrency'),
    ('Ethereum', 'Ethereum cryptocurrency'),
    ('Polygon', 'Polygon cryptocurrency'),
    ('Litecoin', 'Litecoin cryptocurrency'),
    (
        'Binance Smart Chain',
        'Binance Smart Chain cryptocurrency'
    ),
    ('Tether', 'USDT stablecoin'),
    ('Solana', 'Solana cryptocurrency'),
    ('Stock', 'Traditional stock'),
    ('ETF', 'Exchange Traded Fund'),
    ('Bond', 'Government or corporate bond');
INSERT INTO transaction_types (name, description)
VALUES ('buy', 'Purchase of asset'),
    ('sell', 'Sale of asset'),
    ('transfer_in', 'Transfer into wallet'),
    ('transfer_out', 'Transfer out of wallet'),
    ('deposit', 'Deposit funds'),
    ('withdraw', 'Withdraw funds');
-- Add comments to document the balance fields
COMMENT ON COLUMN users.initial_balance IS 'Initial investment amount when user was created or first funded';
COMMENT ON COLUMN users.interest_earned IS 'Total interest/profit earned over time';
COMMENT ON COLUMN users.total_balance IS 'Combined total balance (initial + interest + wallet balances)';
-- Add comments for wallet fields
COMMENT ON COLUMN wallets.wallet_type IS 'Blockchain type: bitcoin, ethereum, polygon, litecoin, binance';
COMMENT ON COLUMN wallets.chain_name IS 'Human-readable blockchain name: Bitcoin, Ethereum, Polygon, etc.';
COMMENT ON COLUMN wallets.symbol IS 'Blockchain symbol: BTC, ETH, MATIC, LTC, BNB, etc.';
COMMENT ON COLUMN wallets.private_key IS 'Encrypted private key for wallet operations (stored securely)';
COMMENT ON COLUMN wallets.public_key IS 'Public key for verification and address generation';
COMMENT ON COLUMN wallets.derivation_path IS 'BIP44 derivation path: m/44''/0''/0''/0 for HD wallet derivation';
COMMENT ON COLUMN wallets.account_index IS 'Account index for HD wallet derivation (0, 1, 2, etc.)';
COMMENT ON COLUMN wallets.seed_phrase_hash IS 'Hash of the seed phrase used to derive this wallet';