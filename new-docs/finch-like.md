Okay, let's design a comprehensive DDL schema for an app like Finch, combining pet养成 (nurturing), 健康习惯管理 (habit management), and mental well-being features. This schema aims for a good balance between normalization and practical query performance. We'll use PostgreSQL syntax again.

**Key Concepts Modeled:**

*   Users & Authentication
*   Pets (Birds) & Customization
*   Habits/Goals & Tracking
*   Rewards (Currency, Items) & Inventory
*   Shop
*   Mood Tracking
*   Guided Journeys/Exercises
*   Social Features (Friends, Vibes)
*   Pet/Environment Customization

```sql
-- ========= ENUM Types =========

CREATE TYPE pet_body_part AS ENUM (
    'headwear',
    'bodywear',
    'accessory' -- e.g., glasses, scarf
    -- Add more slots as needed
);

CREATE TYPE item_category AS ENUM (
    'clothing',       -- For pet
    'furniture',      -- For pet's house/environment
    'wallpaper',      -- Environment background
    'flooring',       -- Environment floor
    'dye',            -- To change pet color
    'consumable',     -- e.g., special food, temporary boost
    'collectible',    -- Items just for collection/discovery
    'theme'           -- A bundle of customization items
);

CREATE TYPE currency_type AS ENUM (
    'rainbow_stones', -- Primary earned currency
    'shiny_gems'      -- Premium or rarer currency (optional)
);

CREATE TYPE habit_frequency_type AS ENUM (
    'daily',
    'weekly',         -- Specific days of the week
    'monthly',        -- Specific day of the month (less common for habits)
    'once'            -- One-time goal
);

CREATE TYPE goal_status AS ENUM (
    'active',
    'completed',
    'archived'
);

CREATE TYPE journey_category AS ENUM (
    'breathing',
    'meditation',
    'reflection',
    'soundscape',
    'movement'
);

CREATE TYPE friendship_status AS ENUM (
    'pending_requester', -- User A sent request to User B
    'pending_receiver',  -- User B received request from User A
    'accepted',
    'blocked'            -- Optional: If blocking is needed
);

CREATE TYPE notification_type AS ENUM (
    'habit_reminder',
    'goal_due',
    'pet_needs_attention', -- e.g., energy low?
    'friend_request',
    'friend_accepted',
    'vibe_received',
    'shop_new_item',
    'journey_suggestion',
    'system_message'
);


-- ========= Core Tables =========

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE,                      -- Optional, might use anonymous IDs initially
    email VARCHAR(255) UNIQUE,                         -- For login/recovery
    password_hash VARCHAR(255),                        -- If using email/password auth
    auth_provider VARCHAR(50),                         -- e.g., 'google', 'apple', 'email'
    auth_provider_id VARCHAR(255),                     -- User ID from the provider
    -- User Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{}'::jsonb,                -- e.g., {"notifications_enabled": true, "theme": "dark", "reminder_sound": "default.mp3"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    UNIQUE (auth_provider, auth_provider_id)           -- Ensure uniqueness per provider
);

-- Base definitions for items available in the game
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category item_category NOT NULL,
    rarity SMALLINT DEFAULT 1 CHECK (rarity > 0),     -- e.g., 1=common, 5=legendary
    icon_url TEXT,                                     -- URL or asset name for the item's icon
    data JSONB DEFAULT '{}'::jsonb,                    -- Extra data, e.g., {"body_part": "headwear", "color_options": ["red", "blue"]} for clothing
                                                       -- or {"restores_energy": 10} for consumables
    is_purchasable BOOLEAN DEFAULT TRUE,               -- Can this be bought in the standard shop?
    is_discoverable BOOLEAN DEFAULT TRUE,              -- Can this be found through exploration/journeys?
    is_tradable BOOLEAN DEFAULT FALSE,                 -- Can users trade this item? (If trading exists)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name); -- If searchable by name

-- ========= Pet & Nurturing Tables =========

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Each user has one primary pet
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) DEFAULT 'Finch',              -- If multiple species are planned
    birth_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Pet State
    current_energy INT NOT NULL DEFAULT 50 CHECK (current_energy >= 0), -- Energy gained from completing tasks
    max_energy INT NOT NULL DEFAULT 100,
    current_mood VARCHAR(50) DEFAULT 'content',       -- e.g., happy, sleepy, adventurous
    level INT NOT NULL DEFAULT 1 CHECK (level > 0),
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),        -- XP towards next level (optional, or derive level from energy spent/gained)
    -- Pet Customization (References items table)
    color_hex VARCHAR(7) DEFAULT '#FFFFFF',            -- Base body color
    headwear_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    bodywear_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    accessory_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    -- Add more customization slots as needed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to track pet's growth stages or specific milestones achieved
CREATE TABLE pet_milestones (
    id BIGSERIAL PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    milestone_key VARCHAR(100) NOT NULL,              -- e.g., 'reached_childhood', 'flew_first_time', 'level_10'
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pet_id, milestone_key)
);


-- ========= Habit & Goal Tracking Tables =========

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),                             -- Identifier for the habit's icon
    color_hex VARCHAR(7),                              -- Color associated with the habit
    -- Scheduling
    frequency_type habit_frequency_type NOT NULL,
    frequency_details JSONB DEFAULT '{}'::jsonb,       -- e.g., {"days_of_week": [1, 3, 5]} for weekly, {"day_of_month": 15} for monthly
    reminder_time TIME,                                -- Optional reminder time (local to user, needs timezone handling)
    -- Rewards
    reward_energy INT DEFAULT 5 CHECK (reward_energy >= 0), -- Energy pet gains on completion
    reward_stones INT DEFAULT 10 CHECK (reward_stones >= 0),-- Currency user gains
    -- Goal Specifics (if frequency_type is 'once')
    due_date DATE,
    status goal_status DEFAULT 'active',
    -- Meta
    is_archived BOOLEAN DEFAULT FALSE,                 -- User can archive habits they no longer track
    sort_order INT DEFAULT 0,                          -- For user-defined ordering
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_id_status ON habits(user_id, status);

-- Records each time a habit/goal is completed
CREATE TABLE task_completions (
    id BIGSERIAL PRIMARY KEY,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Denormalized for easier querying
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_key DATE NOT NULL DEFAULT CURRENT_DATE,       -- The logical date of completion (useful for daily/weekly checks)
    -- Rewards granted at completion time (snapshot)
    energy_earned INT NOT NULL,
    stones_earned INT NOT NULL,
    notes TEXT                                         -- Optional user notes for the completion
);
CREATE INDEX idx_task_completions_user_date ON task_completions(user_id, date_key);
CREATE INDEX idx_task_completions_habit_date ON task_completions(habit_id, date_key);


-- ========= Currency, Items & Shop Tables =========

-- Tracks user currency balances
CREATE TABLE user_currencies (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency currency_type NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    PRIMARY KEY (user_id, currency)
);

-- User's inventory of owned items
CREATE TABLE user_items (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT, -- Don't delete item if someone owns it
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),         -- Typically 1 for non-consumables
    obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- data JSONB DEFAULT '{}'::jsonb,                             -- Instance specific data? (e.g., applied dye color?) - Optional
    PRIMARY KEY (user_id, item_id)
);

-- Defines items currently available in the shop (can change daily/weekly)
CREATE TABLE shop_listings (
    id SERIAL PRIMARY KEY,
    item_id UUID UNIQUE NOT NULL REFERENCES items(id) ON DELETE CASCADE, -- Item being sold
    -- Pricing (can override item's base price)
    price_stones INT CHECK (price_stones >= 0),
    price_gems INT CHECK (price_gems >= 0),
    available_from TIMESTAMPTZ DEFAULT now(),
    available_until TIMESTAMPTZ,                       -- NULL means always available (or until removed)
    stock_quantity INT,                                -- NULL means infinite stock
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_shop_listings_availability ON shop_listings(available_from, available_until);


-- ========= Well-being & Journey Tables =========

-- Records user's mood entries
CREATE TABLE mood_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    mood_rating SMALLINT NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5), -- e.g., 1=Awful, 5=Great
    notes TEXT,                                          -- Optional free text
    tags TEXT[]                                          -- Optional tags (e.g., 'work', 'family', 'tired')
);
CREATE INDEX idx_mood_logs_user_time ON mood_logs(user_id, logged_at DESC);

-- Definitions for guided journeys/exercises
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category journey_category NOT NULL,
    duration_minutes SMALLINT,                          -- Approximate duration
    icon_url TEXT,
    content JSONB NOT NULL,                              -- The actual steps/text/audio URLs for the journey
    -- e.g., {"steps": [{"type": "text", "content": "..."}, {"type": "audio", "url": "...", "duration_sec": 60}]}
    required_level INT DEFAULT 1,                       -- Minimum pet level to unlock? (Optional)
    reward_stones INT DEFAULT 0,
    reward_energy INT DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE                   -- Requires premium currency/subscription? (Optional)
);

-- Tracks user progress within journeys (if they are multi-step or resumable)
CREATE TABLE user_journey_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    last_completed_step INT DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,                          -- NULL if in progress
    UNIQUE (user_id, journey_id)
);


-- ========= Social Tables =========

CREATE TABLE friendships (
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL,
    -- Track who initiated the request/block for status logic
    action_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2) -- Enforce order to prevent duplicate pairs (A,B) and (B,A)
);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1, status);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2, status);

-- Records "vibes" or simple interactions sent between friends
CREATE TABLE friend_vibes (
    id BIGSERIAL PRIMARY KEY,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vibe_type VARCHAR(50) NOT NULL,                    -- e.g., 'hug', 'high_five', 'encouragement'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_received BOOLEAN DEFAULT FALSE                  -- Has the receiver acknowledged it in the app?
);
CREATE INDEX idx_friend_vibes_receiver ON friend_vibes(receiver_user_id, sent_at DESC);


-- ========= Optional: Environment Customization =========
-- If the pet has a "house" or environment that can be customized

CREATE TABLE user_environments (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    wallpaper_item_id UUID REFERENCES items(id) ON DELETE SET NULL CHECK ( (SELECT category FROM items WHERE id = wallpaper_item_id) = 'wallpaper' ),
    flooring_item_id UUID REFERENCES items(id) ON DELETE SET NULL CHECK ( (SELECT category FROM items WHERE id = flooring_item_id) = 'flooring' ),
    -- Store placed furniture items as JSONB or a separate table
    placed_furniture JSONB DEFAULT '[]'::jsonb,       -- Array of objects: [{"item_id": "uuid", "x": 10, "y": 20, "rotation": 0}]
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Separate table for placed furniture if JSONB becomes unwieldy or needs querying
-- CREATE TABLE placed_environment_items (
--     id BIGSERIAL PRIMARY KEY,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
--     position_x FLOAT NOT NULL,
--     position_y FLOAT NOT NULL,
--     rotation FLOAT DEFAULT 0,
--     placed_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
-- CREATE INDEX idx_placed_env_items_user ON placed_environment_items(user_id);


-- ========= Notifications =========
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    reference_id UUID,                                -- e.g., habit_id, user_id (sender), journey_id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);


-- ========= Helper Functions/Triggers =========

-- Trigger function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with an 'updated_at' column
CREATE TRIGGER update_pets_modtime BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_modtime BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_modtime BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_environments_modtime BEFORE UPDATE ON user_environments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Add for other tables like users, user_journey_progress if needed

```

**Key Design Choices & Considerations:**

1.  **UUIDs:** Used for primary keys of major entities (`users`, `pets`, `items`, `habits`, `journeys`) for global uniqueness, beneficial in distributed systems or if merging data later.
2.  **SERIAL/BIGSERIAL:** Used for logs, completions, or simpler entities where a global UUID isn't strictly necessary and sequential IDs are acceptable.
3.  **JSONB:** Used for flexible data structures like `users.settings`, `items.data`, `habits.frequency_details`, `journeys.content`, and `user_environments.placed_furniture`. This allows adding new fields without schema migrations, but querying inside JSONB can be less performant than dedicated columns.
4.  **ENUMs:** Used for predefined categories/types to ensure data consistency and potentially save storage space compared to strings.
5.  **`TIMESTAMPTZ`:** Crucial for all time-related data to handle timezones correctly.
6.  **Indexes:** Basic indexes are included on foreign keys and common query columns. Real-world usage would require analyzing query patterns (`EXPLAIN ANALYZE`) and adding more specific or composite indexes.
7.  **Normalization:** Generally follows normalization principles (e.g., storing `item_id` in `user_items` rather than item details). Some denormalization exists for convenience (e.g., `user_id` in `task_completions`).
8.  **`ON DELETE` Policies:** Carefully chosen (`CASCADE` for tightly coupled data like pet/habits to user, `RESTRICT` for shared data like items, `SET NULL` for optional links like pet equipment). Review these based on exact business rules.
9.  **Pet Energy/XP:** Stored directly on the `pets` table for quick access. Could be purely derived from `task_completions` but that would require calculation on every read.
10. **Flexibility:** Fields like `items.data` or `habits.frequency_details` provide flexibility for future expansion.

This DDL provides a solid foundation. You'd populate the "static" tables (`items`, `journeys`) with game design data, and the application logic would handle user interactions, pet growth calculations, habit tracking logic, and reward distribution by inserting/updating rows in the corresponding tables.
