好的，这里提供一套基本的 PostgreSQL DDL（数据定义语言）脚本，用于支撑一个类似宝可梦 (Pokémon) 的养成类游戏的核心功能。这套表结构考虑了玩家、怪兽（基础定义和玩家拥有的实例）、技能、物品、类型和进化等核心要素。

**注意:**

1.  这是一个**基础版本**，实际游戏可能需要更多表（如任务、成就、好友、交易、PVP 对战记录、世界地图区域等）。
2.  使用了 PostgreSQL 的语法，包括 `UUID` (推荐用于主要实体的 ID)、`SERIAL` (用于简单自增 ID)、`TIMESTAMPTZ` (带时区的时间戳) 和 `ENUM` 类型。
3.  索引是基础的，实际需要根据查询模式进行优化。
4.  外键约束有助于保证数据完整性。`ON DELETE` 策略需要根据业务逻辑仔细选择（这里用了 `CASCADE` 和 `RESTRICT` 作为示例）。
5.  数值平衡、具体技能效果、复杂状态等通常在游戏逻辑代码中处理，数据库主要存储基础数据和状态。

```sql
-- ========= ENUM Types (定义枚举类型) =========

-- 道具分类
CREATE TYPE item_category AS ENUM (
    'potion',       -- 药水 (恢复HP/状态)
    'ball',         -- 捕捉球
    'battle',       -- 战斗中使用物品 (提升能力等)
    'key',          -- 关键道具 (剧情相关)
    'evolution',    -- 进化石/道具
    'misc'          -- 杂项
);

-- 进化触发方式
CREATE TYPE evolution_trigger_type AS ENUM (
    'level_up',     -- 等级提升
    'use_item',     -- 使用道具
    'trade',        -- 交易
    'other'         -- 其他特殊条件 (如亲密度, 特定时间, 特定地点 - 细节在代码中处理)
);

-- 技能学习方式
CREATE TYPE move_learn_method AS ENUM (
    'level_up',     -- 等级提升学会
    'tm_hm',        -- 通过技能机器学会
    'tutor',        -- 通过教学学会
    'breeding',     -- 通过遗传学会
    'event'         -- 通过活动获得
);

-- ========= Core Tables (核心表) =========

-- 玩家/训练师表
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 玩家唯一ID
    username VARCHAR(50) UNIQUE NOT NULL,           -- 用户名
    email VARCHAR(255) UNIQUE,                      -- 邮箱 (可选, 用于登录或找回密码)
    password_hash VARCHAR(255) NOT NULL,            -- 加密后的密码哈希
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- 账号创建时间
    last_login_at TIMESTAMPTZ                       -- 最后登录时间
    -- 可以添加更多玩家信息字段，如头像URL, 游戏设置等
);

-- 怪兽属性/类型表 (例如: 火, 水, 草, 电)
CREATE TABLE creature_types (
    id SERIAL PRIMARY KEY,                         -- 类型ID (用简单自增即可)
    name VARCHAR(50) UNIQUE NOT NULL               -- 类型名称 (Fire, Water, Grass)
    -- 可以添加类型相克关系表 (type_matchups)
);

-- 基础怪兽定义表 (类似宝可梦图鉴)
CREATE TABLE base_creatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 基础怪兽唯一ID
    pokedex_id INT UNIQUE NOT NULL,                 -- 图鉴编号 (方便排序和识别)
    name VARCHAR(100) NOT NULL,                     -- 怪兽名称
    description TEXT,                               -- 图鉴描述
    type1_id INT NOT NULL REFERENCES creature_types(id), -- 主属性
    type2_id INT REFERENCES creature_types(id),     -- 副属性 (可以为 NULL)
    base_hp INT NOT NULL CHECK (base_hp > 0),       -- 基础 HP 种族值
    base_attack INT NOT NULL CHECK (base_attack > 0), -- 基础 攻击 种族值
    base_defense INT NOT NULL CHECK (base_defense > 0), -- 基础 防御 种族值
    base_sp_attack INT NOT NULL CHECK (base_sp_attack > 0), -- 基础 特攻 种族值
    base_sp_defense INT NOT NULL CHECK (base_sp_defense > 0), -- 基础 特防 种族值
    base_speed INT NOT NULL CHECK (base_speed > 0), -- 基础 速度 种族值
    catch_rate SMALLINT CHECK (catch_rate >= 0 AND catch_rate <= 255), -- 捕捉率 (示例)
    xp_yield INT CHECK (xp_yield >= 0),              -- 击败后给予的基础经验值
    -- 可以添加身高、体重、特性(abilities)等字段或关联表
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_base_creatures_name ON base_creatures(name);

-- 技能/招式表
CREATE TABLE moves (
    id SERIAL PRIMARY KEY,                         -- 技能ID (简单自增)
    name VARCHAR(100) UNIQUE NOT NULL,             -- 技能名称
    description TEXT,                              -- 技能描述
    type_id INT NOT NULL REFERENCES creature_types(id), -- 技能属性
    power INT CHECK (power >= 0),                  -- 威力 (0 表示变化类技能)
    accuracy SMALLINT CHECK (accuracy >= 0 AND accuracy <= 100), -- 命中率 (NULL 表示必中)
    pp INT NOT NULL CHECK (pp > 0),                -- 技能点数 (Power Points)
    category VARCHAR(20) NOT NULL CHECK (category IN ('Physical', 'Special', 'Status')), -- 技能分类: 物理, 特殊, 变化
    priority SMALLINT DEFAULT 0,                   -- 优先级 (影响出招顺序)
    -- 可以添加 target (目标选择), effect (特殊效果代码或描述) 等字段
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 基础怪兽可学习技能表 (Learnset)
CREATE TABLE base_creature_learnable_moves (
    id BIGSERIAL PRIMARY KEY,
    base_creature_id UUID NOT NULL REFERENCES base_creatures(id) ON DELETE CASCADE,
    move_id INT NOT NULL REFERENCES moves(id) ON DELETE RESTRICT, -- 通常不希望删除一个还在用的技能
    learn_method move_learn_method NOT NULL, -- 学习方式
    learn_value VARCHAR(50),                 -- 学习条件的值 (如 等级 '15', 道具ID 'item_uuid', TM编号 'TM01')
    UNIQUE (base_creature_id, move_id, learn_method, learn_value) -- 防止重复定义
);
CREATE INDEX idx_bclm_base_creature_id ON base_creature_learnable_moves(base_creature_id);
CREATE INDEX idx_bclm_move_id ON base_creature_learnable_moves(move_id);


-- 进化路径表
CREATE TABLE evolutions (
    id BIGSERIAL PRIMARY KEY,
    from_creature_id UUID NOT NULL REFERENCES base_creatures(id) ON DELETE CASCADE, -- 进化前的怪兽ID
    to_creature_id UUID NOT NULL REFERENCES base_creatures(id) ON DELETE CASCADE,   -- 进化后的怪兽ID
    trigger_type evolution_trigger_type NOT NULL, -- 进化触发方式
    trigger_value VARCHAR(255)                    -- 触发条件的值 (如等级 '36', 道具ID 'item_uuid')
    -- 可以添加更多条件字段，如 location_id, time_of_day, required_move_id 等
);
CREATE INDEX idx_evolutions_from ON evolutions(from_creature_id);
CREATE INDEX idx_evolutions_to ON evolutions(to_creature_id);

-- 道具表
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 道具唯一ID
    name VARCHAR(100) UNIQUE NOT NULL,             -- 道具名称
    description TEXT,                              -- 道具描述
    category item_category NOT NULL,              -- 道具分类
    buy_price INT CHECK (buy_price >= 0),          -- 商店购买价格 (NULL 表示非卖品)
    sell_price INT CHECK (sell_price >= 0),        -- 卖给商店的价格
    -- 可以添加使用效果相关的字段 (如恢复量, 效果代码等)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========= Player Specific Tables (玩家相关数据表) =========

-- 玩家拥有的怪兽实例表 (最重要的表之一)
CREATE TABLE player_creatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         -- 玩家怪兽实例的唯一ID
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE, -- 所属玩家ID
    base_creature_id UUID NOT NULL REFERENCES base_creatures(id) ON DELETE RESTRICT, -- 对应的基础怪兽ID (不希望基础定义没了实例还在)
    nickname VARCHAR(100),                                  -- 昵称 (可以为 NULL, 显示原名)
    level INT NOT NULL DEFAULT 1 CHECK (level > 0 AND level <= 100), -- 等级
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),              -- 当前经验值
    -- 当前能力值 (会受等级、个体值、努力值影响, 通常在代码中计算, 但可以缓存或存储方便查询)
    current_hp INT NOT NULL,                                -- 当前HP
    max_hp INT NOT NULL,                                    -- 最大HP (根据等级等计算)
    attack INT NOT NULL,                                    -- 当前攻击力
    defense INT NOT NULL,                                   -- 当前防御力
    sp_attack INT NOT NULL,                                 -- 当前特攻
    sp_defense INT NOT NULL,                                -- 当前特防
    speed INT NOT NULL,                                     -- 当前速度
    -- 个体值 (IVs, 0-31) - 示例, 可以拆分或合并
    iv_hp SMALLINT NOT NULL DEFAULT 0 CHECK (iv_hp >= 0 AND iv_hp <= 31),
    iv_attack SMALLINT NOT NULL DEFAULT 0 CHECK (iv_attack >= 0 AND iv_attack <= 31),
    iv_defense SMALLINT NOT NULL DEFAULT 0 CHECK (iv_defense >= 0 AND iv_defense <= 31),
    iv_sp_attack SMALLINT NOT NULL DEFAULT 0 CHECK (iv_sp_attack >= 0 AND iv_sp_attack <= 31),
    iv_sp_defense SMALLINT NOT NULL DEFAULT 0 CHECK (iv_sp_defense >= 0 AND iv_sp_defense <= 31),
    iv_speed SMALLINT NOT NULL DEFAULT 0 CHECK (iv_speed >= 0 AND iv_speed <= 31),
    -- 努力值 (EVs, 0-252, 总和 <= 510) - 示例
    ev_hp SMALLINT NOT NULL DEFAULT 0 CHECK (ev_hp >= 0 AND ev_hp <= 252),
    ev_attack SMALLINT NOT NULL DEFAULT 0 CHECK (ev_attack >= 0 AND ev_attack <= 252),
    -- ... (其他EVs) ...
    held_item_id UUID REFERENCES items(id) ON DELETE SET NULL, -- 携带的道具
    is_in_party BOOLEAN NOT NULL DEFAULT FALSE,             -- 是否在当前队伍中 (通常队伍上限6)
    party_slot SMALLINT CHECK (party_slot >= 1 AND party_slot <= 6), -- 在队伍中的位置 (如果 is_in_party=true)
    caught_at TIMESTAMPTZ NOT NULL DEFAULT now(),           -- 捕捉时间
    -- 可以添加性别(gender), 性格(nature), 亲密度(friendship), 状态异常(status_condition)等
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_player_creatures_player_id ON player_creatures(player_id);
CREATE INDEX idx_player_creatures_base_creature_id ON player_creatures(base_creature_id);
-- 确保一个玩家的队伍中位置不重复
CREATE UNIQUE INDEX idx_player_creatures_party_slot ON player_creatures(player_id, party_slot) WHERE is_in_party = TRUE;

-- 玩家怪兽已学会的技能表 (实例技能)
CREATE TABLE player_creature_moves (
    id BIGSERIAL PRIMARY KEY,
    player_creature_id UUID NOT NULL REFERENCES player_creatures(id) ON DELETE CASCADE,
    move_id INT NOT NULL REFERENCES moves(id) ON DELETE RESTRICT,
    slot_index SMALLINT NOT NULL CHECK (slot_index >= 1 AND slot_index <= 4), -- 技能槽位置 (1-4)
    current_pp SMALLINT NOT NULL, -- 当前技能剩余 PP 值
    max_pp SMALLINT NOT NULL,     -- 该技能最大 PP 值 (可能会受道具影响)
    UNIQUE (player_creature_id, slot_index), -- 一个怪兽一个槽位只能有一个技能
    UNIQUE (player_creature_id, move_id) -- 一个怪兽不能重复学习同一个技能到不同槽位 (通常规则)
);
CREATE INDEX idx_pcm_player_creature_id ON player_creature_moves(player_creature_id);

-- 玩家背包/道具库存表
CREATE TABLE player_items (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0), -- 拥有数量
    PRIMARY KEY (player_id, item_id) -- 复合主键
);

-- ========= Optional Tables (可选功能表) =========

-- 排行榜记录表 (示例: 按玩家等级排行)
CREATE TABLE leaderboards (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE, -- 玩家ID (假设一个玩家只有一条最高等级记录)
    player_username VARCHAR(50) NOT NULL, -- 冗余存储用户名方便查询显示
    highest_level INT NOT NULL,         -- 记录的分数或指标 (这里用玩家拥有的最高怪兽等级代替)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leaderboards_score ON leaderboards(highest_level DESC);

-- 商店可售商品表 (如果不是所有 item 都能买)
CREATE TABLE store_items (
    id SERIAL PRIMARY KEY,
    item_id UUID UNIQUE NOT NULL REFERENCES items(id) ON DELETE CASCADE, -- 对应的道具 ID
    sort_order INT DEFAULT 0 -- 商店中的排序
    -- 可以添加条件字段，如需要特定徽章才能购买等
);

-- 玩家货币表 (可以放在 players 表，但分开更清晰)
CREATE TABLE player_currency (
     player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
     gold BIGINT NOT NULL DEFAULT 0 CHECK (gold >= 0), -- 游戏金币
     gems BIGINT NOT NULL DEFAULT 0 CHECK (gems >= 0) -- 付费货币 (钻石/宝石)
);

-- 触发器：自动更新 updated_at 时间戳 (示例)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器到需要自动更新时间的表
CREATE TRIGGER update_player_creatures_modtime BEFORE UPDATE ON player_creatures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboards_modtime BEFORE UPDATE ON leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... 可以为其他需要追踪更新时间的表添加类似触发器 ...

```

**使用说明:**

1.  **执行顺序:** 先创建 `ENUM` 类型，然后创建没有外键依赖或依赖已创建表的表（如 `players`, `creature_types`, `moves`, `items`, `base_creatures`），再创建依赖这些表的表。
2.  **数据填充 (Seeding):** 你需要编写脚本（例如使用 `packages/db/seed.ts`）来填充基础数据，如 `creature_types`, `moves`, `items`, `base_creatures`, `base_creature_learnable_moves`, `evolutions` 等，否则游戏无法运行。
3.  **能力值计算:** `player_creatures` 表中存储了基础的 IV/EV，但实际的 `max_hp`, `attack` 等属性通常需要在游戏逻辑中根据宝可梦的公式动态计算得出，这里存储它们可以视为一种缓存或快照。
4.  **简化:** 省略了很多细节表，如特性(Abilities)、状态效果(Status Conditions)的具体定义和关联、不同捕捉球的效果、好友系统、交易记录、PVP 对战详细日志等。

这套 DDL 为你的类宝可梦游戏提供了一个坚实的数据基础，你可以根据具体需求进行扩展和修改。
