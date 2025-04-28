Okay, let's design a comprehensive DDL schema for a generic **Strategy Game**. This schema aims to cover common elements found in many strategy subgenres (RTS-lite, 4X-lite, Base Building, etc.), focusing on resource management, unit/building construction, research, map control, and potentially multiplayer interactions.

We'll use PostgreSQL syntax.

**Core Concepts Modeled:**

*   Users & Game Sessions/Worlds
*   Player Factions/Empires within a Session
*   Resources & Storage
*   Base Definitions (Units, Buildings, Technologies)
*   Player-Owned Instances (Units, Buildings, Researched Techs)
*   Map Representation (Regions/Provinces)
*   Combat & Diplomacy (Basic)

```sql
-- ========= ENUM Types =========

CREATE TYPE resource_type_enum AS ENUM (
    'gold',
    'wood',
    'stone',
    'food',
    'mana',
    'energy',
    'research_points'
    -- Add more specific resources
);

CREATE TYPE unit_role_enum AS ENUM (
    'infantry',
    'cavalry',
    'ranged',
    'siege',
    'support',
    'worker',
    'scout',
    'hero'
);

CREATE TYPE building_category_enum AS ENUM (
    'resource_generator',
    'unit_production',
    'research',
    'defense',
    'storage',
    'economy',
    'wonder' -- Special unique buildings
);

CREATE TYPE map_terrain_enum AS ENUM (
    'plains',
    'forest',
    'hills',
    'mountains',
    'water',
    'desert',
    'swamp'
);

CREATE TYPE game_session_status_enum AS ENUM (
    'lobby',        -- Waiting for players
    'ongoing',
    'paused',
    'finished',
    'archived'
);

CREATE TYPE diplomacy_status_enum AS ENUM (
    'war',
    'neutral',
    'alliance',
    'trade_partner'
);

-- ========= Core Game & Player Setup =========

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

-- Represents a specific game instance, world, or match
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),                          -- Optional name for the session/world
    status game_session_status_enum NOT NULL DEFAULT 'lobby',
    max_players SMALLINT CHECK (max_players > 0),
    current_turn INT DEFAULT 0,                 -- For turn-based games
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    -- Map/World configuration (could reference a map template ID)
    map_config JSONB DEFAULT '{}'::jsonb,        -- e.g., {"size": "medium", "seed": "xyz"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Represents a player's active participation and state within a specific game session
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for player *in this session*
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to the user account
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE, -- Link to the game session
    faction_name VARCHAR(100),                  -- e.g., "Romans", "Elves", "Federation"
    color_hex VARCHAR(7),                       -- Player color in the game
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,       -- Is this player controlled by AI?
    -- Session-specific status
    is_eliminated BOOLEAN NOT NULL DEFAULT FALSE,
    elimination_turn INT,
    score INT DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, session_id),               -- A user can only be one player per session
    UNIQUE (session_id, faction_name)          -- Faction names unique per session (optional rule)
);
CREATE INDEX idx_players_session_id ON players(session_id);

-- Player resource balances within a session
CREATE TABLE player_resources (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    resource_type resource_type_enum NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    storage_capacity BIGINT NOT NULL DEFAULT 1000, -- Max storable amount
    income_rate FLOAT NOT NULL DEFAULT 0,        -- Resources generated per turn/second
    PRIMARY KEY (player_id, resource_type)
);

-- ========= Static Game Data Definitions =========

CREATE TABLE resource_types (
    id resource_type_enum PRIMARY KEY,         -- Use the ENUM as the primary key
    name VARCHAR(50) NOT NULL,
    description TEXT,
    base_storage_capacity BIGINT DEFAULT 1000
);
-- Populate this table with one row per enum value

-- Base definitions for unit types
CREATE TABLE unit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    role unit_role_enum,
    icon_url TEXT,
    model_asset_name VARCHAR(100),
    -- Costs
    cost_gold INT DEFAULT 0 CHECK (cost_gold >= 0),
    cost_wood INT DEFAULT 0 CHECK (cost_wood >= 0),
    cost_food INT DEFAULT 0 CHECK (cost_food >= 0),
    cost_mana INT DEFAULT 0 CHECK (cost_mana >= 0),
    upkeep_cost FLOAT DEFAULT 0,               -- Cost per turn/period
    build_time_seconds FLOAT CHECK (build_time_seconds > 0),
    -- Combat Stats
    base_hp INT NOT NULL CHECK (base_hp > 0),
    base_attack FLOAT CHECK (base_attack >= 0),
    base_defense FLOAT CHECK (base_defense >= 0),
    attack_range FLOAT CHECK (attack_range >= 0),
    attack_speed FLOAT CHECK (attack_speed > 0), -- Attacks per second
    movement_speed FLOAT CHECK (movement_speed >= 0),
    -- Abilities/Special Rules (JSONB for flexibility)
    abilities JSONB DEFAULT '{}'::jsonb,        -- e.g., {"can_fly": true, "stealth_detection_range": 5, "special_skill_id": 1}
    -- Requirements
    required_tech_id INT, -- REFERENCES technology_types(id) - Add FK later
    required_building_id INT -- REFERENCES building_types(id) - Add FK later
);

-- Base definitions for building types
CREATE TABLE building_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category building_category_enum,
    icon_url TEXT,
    model_asset_name VARCHAR(100),
    -- Costs
    cost_gold INT DEFAULT 0 CHECK (cost_gold >= 0),
    cost_wood INT DEFAULT 0 CHECK (cost_wood >= 0),
    cost_stone INT DEFAULT 0 CHECK (cost_stone >= 0),
    build_time_seconds FLOAT CHECK (build_time_seconds > 0),
    -- Stats
    base_hp INT NOT NULL CHECK (base_hp > 0),
    -- Production/Effects (JSONB for flexibility)
    production JSONB DEFAULT '{}'::jsonb,       -- e.g., {"resource": "gold", "rate": 5}, {"trains_units": [1, 2, 5]} (unit_type_ids)
    effects JSONB DEFAULT '{}'::jsonb,          -- e.g., {"increases_storage": {"resource": "wood", "amount": 500}}, {"defense_bonus_radius": 3}
    -- Requirements
    required_tech_id INT, -- REFERENCES technology_types(id)
    max_instances_per_player SMALLINT -- e.g., 1 for Wonders
);

-- Base definitions for technologies
CREATE TABLE technology_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    -- Costs
    cost_research_points INT CHECK (cost_research_points >= 0),
    research_time_seconds FLOAT CHECK (research_time_seconds > 0),
    -- Effects (JSONB for flexibility)
    effects JSONB DEFAULT '{}'::jsonb,          -- e.g., {"unlocks_unit": 3}, {"improves_stat": {"unit_role": "infantry", "stat": "attack", "percentage": 10}}
    -- Requirements (Tech Tree)
    required_tech_ids INT[] DEFAULT '{}' -- Array of prerequisite technology_types(id)
);

-- Add foreign key constraints now that tables are defined
ALTER TABLE unit_types ADD CONSTRAINT fk_unit_req_tech FOREIGN KEY (required_tech_id) REFERENCES technology_types(id) ON DELETE SET NULL;
ALTER TABLE unit_types ADD CONSTRAINT fk_unit_req_building FOREIGN KEY (required_building_id) REFERENCES building_types(id) ON DELETE SET NULL;
ALTER TABLE building_types ADD CONSTRAINT fk_building_req_tech FOREIGN KEY (required_tech_id) REFERENCES technology_types(id) ON DELETE SET NULL;


-- ========= Player Instance Data (Specific to a Game Session) =========

-- Instances of units owned by a player in a session
CREATE TABLE player_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    unit_type_id INT NOT NULL REFERENCES unit_types(id) ON DELETE RESTRICT, -- Keep unit type even if player gone? RESTRICT is safer.
    current_hp INT NOT NULL,
    level INT DEFAULT 1,                         -- If units can level up
    xp INT DEFAULT 0,
    -- Location (adjust based on map type)
    map_region_id INT, -- REFERENCES map_regions(id) - Add FK later if using regions
    position_x FLOAT, -- Or use exact coordinates if tile-based
    position_y FLOAT,
    status VARCHAR(50) DEFAULT 'idle',           -- e.g., 'idle', 'moving', 'attacking', 'gathering', 'garrisoned'
    target_entity_id UUID,                      -- ID of the unit/building being targeted (could be player_units.id or player_buildings.id)
    garrisoned_in_building_id UUID, -- REFERENCES player_buildings(id)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_player_units_player_id ON player_units(player_id);
CREATE INDEX idx_player_units_region ON player_units(map_region_id); -- If using regions

-- Instances of buildings owned by a player in a session
CREATE TABLE player_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    building_type_id INT NOT NULL REFERENCES building_types(id) ON DELETE RESTRICT,
    current_hp INT NOT NULL,
    level INT DEFAULT 1,                         -- If buildings can level up
    -- Location
    map_region_id INT, -- REFERENCES map_regions(id)
    position_x FLOAT,
    position_y FLOAT,
    is_constructing BOOLEAN DEFAULT TRUE,
    construction_complete_time TIMESTAMPTZ,
    -- Production queue (JSONB for flexibility)
    production_queue JSONB DEFAULT '[]'::jsonb, -- Array of objects: [{"unit_type_id": 1, "start_time": "...", "completion_time": "..."}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_player_buildings_player_id ON player_buildings(player_id);
CREATE INDEX idx_player_buildings_region ON player_buildings(map_region_id); -- If using regions

-- Add garrison FK now that player_buildings is defined
ALTER TABLE player_units ADD CONSTRAINT fk_unit_garrison FOREIGN KEY (garrisoned_in_building_id) REFERENCES player_buildings(id) ON DELETE SET NULL;

-- Tracks technologies researched by a player in a session
CREATE TABLE player_technologies (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    technology_type_id INT NOT NULL REFERENCES technology_types(id) ON DELETE RESTRICT,
    is_researching BOOLEAN DEFAULT FALSE,
    research_complete_time TIMESTAMPTZ,
    researched_at TIMESTAMPTZ,                   -- When fully completed
    PRIMARY KEY (player_id, technology_type_id)
);


-- ========= Map Representation (Example: Region-based) =========

CREATE TABLE map_regions (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100),
    terrain map_terrain_enum NOT NULL,
    controlling_player_id UUID REFERENCES players(id) ON DELETE SET NULL, -- Current owner of the region
    -- Adjacency (can be complex; adjacency list or separate table)
    adjacent_region_ids INT[] DEFAULT '{}',
    -- Geometric representation (optional)
    -- boundaries GEOMETRY(Polygon, 4326), -- Requires PostGIS extension
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_map_regions_session_id ON map_regions(session_id);
CREATE INDEX idx_map_regions_controller ON map_regions(controlling_player_id);
-- Add FKs for player_units and player_buildings map_region_id
ALTER TABLE player_units ADD CONSTRAINT fk_unit_region FOREIGN KEY (map_region_id) REFERENCES map_regions(id) ON DELETE SET NULL;
ALTER TABLE player_buildings ADD CONSTRAINT fk_building_region FOREIGN KEY (map_region_id) REFERENCES map_regions(id) ON DELETE SET NULL;

-- Resource deposits within regions
CREATE TABLE region_resources (
    region_id INT NOT NULL REFERENCES map_regions(id) ON DELETE CASCADE,
    resource_type resource_type_enum NOT NULL,
    initial_amount BIGINT NOT NULL,
    current_amount BIGINT NOT NULL,
    PRIMARY KEY (region_id, resource_type)
);


-- ========= Interactions & Logs =========

-- Records outcomes of combats (simplified)
CREATE TABLE combat_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    attacker_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    defender_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    map_region_id INT REFERENCES map_regions(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    winner_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    -- Store participating units/losses as JSONB or link to detailed logs
    details JSONB DEFAULT '{}'::jsonb, -- e.g., {"attackers": [{"unit_type": 1, "count": 10, "lost": 2}], "defenders": [...]}
    log_time TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_combat_logs_session ON combat_logs(session_id, log_time DESC);

-- Tracks diplomatic relationships between players in a session
CREATE TABLE diplomacy_relations (
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_id_1 UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player_id_2 UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status diplomacy_status_enum NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, player_id_1, player_id_2),
    CHECK (player_id_1 < player_id_2) -- Enforce order for unique pairs
);
CREATE INDEX idx_diplomacy_player1 ON diplomacy_relations(player_id_1, status);
CREATE INDEX idx_diplomacy_player2 ON diplomacy_relations(player_id_2, status);


-- ========= Helper Functions/Triggers =========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers if needed (e.g., on diplomacy_relations)
-- CREATE TRIGGER update_diplomacy_modtime BEFORE UPDATE ON diplomacy_relations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

```

**Key Design Choices & Considerations:**

1.  **Session Context:** Most player-specific data (`players`, `player_resources`, `player_units`, `player_buildings`, `player_technologies`) is tied to a `game_sessions` ID. This allows for multiple concurrent games or persistent worlds.
2.  **Definition vs. Instance:** Clear separation between static definitions (`unit_types`, `building_types`, `technology_types`) and player-owned instances (`player_units`, `player_buildings`, `player_technologies`).
3.  **Flexibility with JSONB:** Used for costs (handling multiple resource types easily), abilities, production details, tech effects, and combat log details. This reduces the need for many sparse columns or complex join tables for variable data. Querying within JSONB requires specific operators.
4.  **Map Representation:** Uses a region-based model. A tile-based map would require a `map_tiles` table and potentially different location tracking on units/buildings.
5.  **Resources:** Uses a `player_resources` table, allowing easy addition of new resource types via the `ENUM` and `resource_types` table. Includes income and capacity.
6.  **Combat Logs:** Simplified log. A full replay system would likely require storing a stream of actions or more detailed event logs.
7.  **Scalability:** For very large scale (e.g., MMO strategy), extensive indexing, partitioning (especially for `player_units`, `player_buildings`, `combat_logs`), read replicas, and potentially NoSQL databases for certain data types (like action logs) might be necessary.
8.  **Technology Tree:** Implemented simply using `required_tech_ids` array on `technology_types`. More complex trees might need a dedicated `tech_prerequisites` table.
9.  **Game Logic:** This DDL stores the *state*. The complex game logic (combat calculations, AI behavior, resource income updates, tech effect application) resides in the application server code.

This schema provides a comprehensive foundation for a wide range of strategy games. Adapt and extend it based on the specific mechanics and scale of your game. Remember to populate definition tables (`unit_types`, `building_types`, etc.) with your game's design data.
