Okay, let's design a DDL schema for a Tower Defense game with card-drawing mechanics, tower evolution, and friend PVP battles. We'll again use PostgreSQL syntax.

**Core Concepts Modeled:**

*   Users, Currency, Daily Draws
*   Base Tower Definitions (Types)
*   Player-Owned Tower Instances (Collection)
*   Tower Skills/Abilities
*   Tower Evolution Paths
*   Card Pools (Gacha)
*   Friendships
*   PVP Matches & Logs

```sql
-- ========= ENUM Types =========

CREATE TYPE currency_type AS ENUM (
    'gold',          -- Standard in-game currency
    'gems',          -- Premium currency
    'draw_tickets'   -- Specific tickets for card draws
);

CREATE TYPE tower_target_type AS ENUM (
    'ground',
    'air',
    'both'
);

CREATE TYPE tower_damage_type AS ENUM (
    'physical',
    'magical',
    'piercing',
    'siege'
    -- Add more as needed
);

CREATE TYPE skill_type AS ENUM (
    'active',      -- Requires activation (e.g., special ability)
    'passive',     -- Always active effect
    'aura',        -- Affects nearby towers/enemies
    'on_attack',   -- Triggers on attack
    'on_hit'       -- Triggers when hit (if tower is targetable)
);

CREATE TYPE gacha_item_type AS ENUM (
    'tower',
    'currency',
    'item' -- e.g., evolution materials
);

CREATE TYPE friendship_status AS ENUM (
    'pending_requester',
    'pending_receiver',
    'accepted',
    'blocked'
);

CREATE TYPE pvp_match_status AS ENUM (
    'pending_invite', -- Waiting for opponent to accept
    'ongoing',
    'finished',
    'cancelled',
    'declined'
);

-- ========= Core Tables =========

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    -- Player progression info
    player_level INT NOT NULL DEFAULT 1,
    player_xp INT NOT NULL DEFAULT 0
);

CREATE TABLE user_currencies (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency currency_type NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    PRIMARY KEY (user_id, currency)
);

-- Tracks daily login/draw status
CREATE TABLE user_daily_status (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_free_draw_used BOOLEAN NOT NULL DEFAULT FALSE,
    last_daily_draw_reset TIMESTAMPTZ DEFAULT now() -- Tracks when the flag was last reset
);

-- Base definitions for skills/abilities towers can have
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type skill_type NOT NULL,
    cooldown_seconds FLOAT CHECK (cooldown_seconds >= 0), -- For active skills
    -- Effect details can be complex; JSONB offers flexibility
    effect_data JSONB DEFAULT '{}'::jsonb -- e.g., {"damage_multiplier": 1.5, "duration": 5, "status_effect": "slow", "aoe_radius": 3}
);

-- Base definitions for tower types (the blueprints)
CREATE TABLE tower_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    rarity SMALLINT NOT NULL DEFAULT 1 CHECK (rarity > 0), -- e.g., 1=Common, 5=Legendary
    icon_url TEXT,
    model_asset_name VARCHAR(100), -- For in-game model
    -- In-game placement cost
    build_cost INT NOT NULL CHECK (build_cost >= 0),
    -- Base stats (level 1)
    base_hp INT CHECK (base_hp > 0), -- If towers can be targeted/destroyed
    base_attack FLOAT CHECK (base_attack >= 0),
    base_attack_speed FLOAT CHECK (base_attack_speed > 0), -- Attacks per second
    base_range FLOAT CHECK (base_range > 0),
    target_type tower_target_type NOT NULL,
    damage_type tower_damage_type NOT NULL,
    -- Tags for synergies/filtering
    tags TEXT[], -- e.g., ['splash', 'single_target', 'support', 'fire']
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tower_types_rarity ON tower_types(rarity);

-- Link table for skills a tower type possesses
CREATE TABLE tower_type_skills (
    tower_type_id INT NOT NULL REFERENCES tower_types(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE RESTRICT, -- Don't delete skill if used by a tower
    unlock_level INT NOT NULL DEFAULT 1, -- Level the tower type needs to reach to unlock this skill (if applicable)
    PRIMARY KEY (tower_type_id, skill_id)
);

-- Defines evolution paths for towers
CREATE TABLE evolutions (
    id SERIAL PRIMARY KEY,
    from_tower_type_id INT NOT NULL REFERENCES tower_types(id) ON DELETE CASCADE,
    to_tower_type_id INT UNIQUE NOT NULL REFERENCES tower_types(id) ON DELETE CASCADE, -- Usually a tower evolves into only one specific type
    -- Requirements for evolution
    required_level INT NOT NULL CHECK (required_level > 1), -- Level the 'from' tower must reach
    cost_gold INT DEFAULT 0 CHECK (cost_gold >= 0),
    cost_gems INT DEFAULT 0 CHECK (cost_gems >= 0),
    -- Could require specific items (link to an items table if needed)
    -- required_item_id UUID REFERENCES items(id),
    -- required_item_quantity INT,
    UNIQUE (from_tower_type_id, to_tower_type_id)
);
CREATE INDEX idx_evolutions_from ON evolutions(from_tower_type_id);


-- ========= Player Collection Tables =========

-- Specific tower instances owned by players (THEIR collection)
CREATE TABLE player_towers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for this specific tower instance
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tower_type_id INT NOT NULL REFERENCES tower_types(id) ON DELETE RESTRICT, -- Link to the blueprint
    level INT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    -- Instance-specific modifications or applied cosmetics could go here
    -- cosmetic_skin_id UUID REFERENCES items(id),
    obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Maybe track duplicates for merging/upgrading systems?
    -- is_locked BOOLEAN DEFAULT FALSE, -- Prevent accidental deletion/merging
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_player_towers_user_type ON player_towers(user_id, tower_type_id);


-- ========= Gacha / Card Draw Tables =========

-- Defines different card pools (e.g., 'Standard Banner', 'Featured Event Banner')
CREATE TABLE gacha_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    -- Cost per draw
    cost_gold INT CHECK (cost_gold >= 0),
    cost_gems INT CHECK (cost_gems >= 0),
    cost_tickets INT CHECK (cost_tickets >= 0)
);

-- Items available within a specific gacha pool, with their probabilities/weights
CREATE TABLE gacha_pool_items (
    id BIGSERIAL PRIMARY KEY,
    pool_id INT NOT NULL REFERENCES gacha_pools(id) ON DELETE CASCADE,
    item_type gacha_item_type NOT NULL,
    -- Reference to the actual item/tower/currency
    reference_id VARCHAR(36) NOT NULL, -- Can store UUID for tower/item, or currency_type enum as string
    -- Data for the item (redundant but useful for display/gacha logic)
    item_name VARCHAR(100), -- e.g., Tower Name, 'Gold', 'Gems'
    item_rarity SMALLINT,    -- e.g., Tower Rarity
    quantity INT DEFAULT 1,  -- How many are granted (e.g., 1 tower, 100 gold)
    -- Probability / Weighting
    weight FLOAT NOT NULL CHECK (weight > 0), -- Higher weight = more likely (relative to sum of weights in pool)
    -- Or use explicit probability: probability FLOAT CHECK (probability > 0 AND probability <= 1),
    is_featured BOOLEAN DEFAULT FALSE -- Is this a rate-up item?
);
CREATE INDEX idx_gacha_pool_items_pool ON gacha_pool_items(pool_id);

-- Log of player gacha draws (useful for history, pity system implementation)
CREATE TABLE gacha_draw_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id INT NOT NULL REFERENCES gacha_pools(id) ON DELETE RESTRICT, -- Keep log even if pool deleted
    drawn_item_type gacha_item_type NOT NULL,
    drawn_reference_id VARCHAR(36) NOT NULL,
    drawn_item_name VARCHAR(100),
    drawn_item_rarity SMALLINT,
    drawn_quantity INT,
    draw_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    cost_currency currency_type,
    cost_amount BIGINT
    -- Add fields for pity system tracking if needed (e.g., draws_since_last_ssr)
);
CREATE INDEX idx_gacha_draw_log_user ON gacha_draw_log(user_id, draw_time DESC);


-- ========= Social & PVP Tables =========

CREATE TABLE friendships (
    user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL,
    action_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1, status);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2, status);

-- Records initiated PVP matches
CREATE TABLE pvp_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Participants
    player1_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Use SET NULL if user deleted but want to keep match record
    player2_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    -- Match Details
    status pvp_match_status NOT NULL,
    winner_player_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if draw or ongoing/cancelled
    map_seed VARCHAR(100), -- Seed or identifier for the map used
    start_time TIMESTAMPTZ, -- When the match actually began
    end_time TIMESTAMPTZ,   -- When the match concluded
    -- Rewards/Rank Change (optional)
    -- player1_rank_change INT,
    -- player2_rank_change INT,
    -- player1_reward_gold INT,
    -- player2_reward_gold INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now() -- When the invite was created
);
CREATE INDEX idx_pvp_matches_p1_status ON pvp_matches(player1_id, status, created_at DESC);
CREATE INDEX idx_pvp_matches_p2_status ON pvp_matches(player2_id, status, created_at DESC);

-- Detailed log of events within a single PVP match (CAN GET VERY LARGE)
CREATE TABLE pvp_match_events (
    id BIGSERIAL PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES pvp_matches(id) ON DELETE CASCADE,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(), -- Or use a turn number / frame number
    event_type VARCHAR(50) NOT NULL, -- e.g., 'TOWER_PLACED', 'ENEMY_SPAWNED', 'TOWER_UPGRADED', 'SKILL_USED', 'ENEMY_REACHED_GOAL', 'TOWER_DESTROYED'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Which player performed the action (if applicable)
    -- Event details (flexible storage)
    event_data JSONB DEFAULT '{}'::jsonb
    -- e.g., {"tower_instance_id": "uuid", "tower_type_id": 1, "x": 10, "y": 5}
    -- e.g., {"enemy_id": "e123", "enemy_type": "goblin", "path_id": 1}
    -- e.g., {"skill_id": 5, "target_enemy_id": "e456"}
    -- e.g., {"player_hp_lost": 1}
);
CREATE INDEX idx_pvp_match_events_match ON pvp_match_events(match_id, event_timestamp);
-- Consider partitioning this table by match_id or time if it grows huge


-- ========= Helper Functions/Triggers =========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_towers_modtime BEFORE UPDATE ON player_towers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_modtime BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Add for other tables like users if needed

```

**Key Design Choices & Considerations:**

1.  **`tower_types` vs `player_towers`:** This distinction is crucial. `tower_types` are the static definitions (like blueprints), while `player_towers` are the specific instances owned and leveled up by the player.
2.  **Skills:** Abstracted into their own table (`skills`) and linked to `tower_types` via `tower_type_skills`. This allows skills to be potentially reused across different towers.
3.  **Gacha System:** Includes pools (`gacha_pools`) and the items within them with weights (`gacha_pool_items`). A log (`gacha_draw_log`) is essential for tracking and potential pity systems.
4.  **Evolutions:** Clearly defined path from one `tower_type` to another with requirements.
5.  **PVP Logs:** The `pvp_match_events` table stores detailed turn-by-turn or event-by-event data using JSONB for flexibility. **This table needs careful performance consideration** due to potentially massive size. Storing full replays might involve saving the entire event stream or potentially using a different storage mechanism (like object storage for replay files).
6.  **User Daily Status:** A simple way to track daily resets for free draws or other daily limits.
7.  **Flexibility:** Use of `JSONB` for `effect_data` and `event_data` allows adding complex parameters without frequent schema changes.
8.  **Indexes:** Basic indexes provided; optimize based on actual query load. The `pvp_match_events` table especially will need careful indexing or partitioning strategies.

This schema provides a robust starting point for a tower defense game with the specified features. Remember to populate static tables (`tower_types`, `skills`, `evolutions`, `gacha_pools`, `gacha_pool_items`) with your game design data.
