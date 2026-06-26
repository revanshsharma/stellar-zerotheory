#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error,
    Address, Env, String, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    NotFound = 2,
    AlreadyJoined = 3,
    AlreadyCompleted = 4,
    NotParticipant = 5,
}

#[contracttype]
#[derive(Clone)]
pub struct Challenge {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub category: String,
    pub stake: i128,
    pub completed: bool,
    pub winner: Option<Address>,
    pub player_count: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct PlayerStats {
    pub xp: u64,
    pub challenges_won: u32,
    pub challenges_joined: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    ChallengeCount,
    Challenge(u64),
    Player(Address),
    ChallengePlayers(u64),
}

#[contract]
pub struct ZeroTheory;

#[contractimpl]
impl ZeroTheory {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ChallengeCount, &0u64);
    }

    pub fn create_challenge(env: Env, creator: Address, title: String, category: String, stake: i128) -> u64 {
        creator.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if creator != admin { panic_with_error!(&env, Error::NotAuthorized); }

        let mut count: u64 = env.storage().instance().get(&DataKey::ChallengeCount).unwrap();
        count += 1;

        let challenge = Challenge {
            id: count, creator, title, category, stake,
            completed: false, winner: None, player_count: 0,
        };

        env.storage().instance().set(&DataKey::ChallengeCount, &count);
        env.storage().persistent().set(&DataKey::Challenge(count), &challenge);
        env.storage().persistent().set(&DataKey::ChallengePlayers(count), &Vec::<Address>::new(&env));
        count
    }

    pub fn join_challenge(env: Env, player: Address, challenge_id: u64) {
        player.require_auth();
        let mut challenge: Challenge = env.storage().persistent()
            .get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));
        if challenge.completed { panic_with_error!(&env, Error::AlreadyCompleted); }

        let mut players: Vec<Address> = env.storage().persistent()
            .get(&DataKey::ChallengePlayers(challenge_id)).unwrap();
        for p in players.iter() { if p == player { panic_with_error!(&env, Error::AlreadyJoined); } }

        players.push_back(player.clone());
        challenge.player_count += 1;
        env.storage().persistent().set(&DataKey::ChallengePlayers(challenge_id), &players);
        env.storage().persistent().set(&DataKey::Challenge(challenge_id), &challenge);

        let mut stats: PlayerStats = env.storage().persistent()
            .get(&DataKey::Player(player.clone()))
            .unwrap_or(PlayerStats { xp: 0, challenges_won: 0, challenges_joined: 0 });
        stats.challenges_joined += 1;
        env.storage().persistent().set(&DataKey::Player(player), &stats);
    }

    pub fn complete_challenge(env: Env, caller: Address, challenge_id: u64, winner: Address) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin { panic_with_error!(&env, Error::NotAuthorized); }

        let mut challenge: Challenge = env.storage().persistent()
            .get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));
        if challenge.completed { panic_with_error!(&env, Error::AlreadyCompleted); }

        let players: Vec<Address> = env.storage().persistent()
            .get(&DataKey::ChallengePlayers(challenge_id)).unwrap();
        let mut found = false;
        for p in players.iter() { if p == winner { found = true; break; } }
        if !found { panic_with_error!(&env, Error::NotParticipant); }

        challenge.completed = true;
        challenge.winner = Some(winner.clone());
        env.storage().persistent().set(&DataKey::Challenge(challenge_id), &challenge);

        let mut stats: PlayerStats = env.storage().persistent()
            .get(&DataKey::Player(winner.clone()))
            .unwrap_or(PlayerStats { xp: 0, challenges_won: 0, challenges_joined: 0 });
        stats.challenges_won += 1;
        stats.xp += 100;
        env.storage().persistent().set(&DataKey::Player(winner), &stats);
    }

    pub fn get_challenge(env: Env, challenge_id: u64) -> Challenge {
        env.storage().persistent()
            .get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }

    pub fn get_player_stats(env: Env, player: Address) -> PlayerStats {
        env.storage().persistent()
            .get(&DataKey::Player(player))
            .unwrap_or(PlayerStats { xp: 0, challenges_won: 0, challenges_joined: 0 })
    }

    pub fn get_challenge_players(env: Env, challenge_id: u64) -> Vec<Address> {
        env.storage().persistent()
            .get(&DataKey::ChallengePlayers(challenge_id))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_challenge_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ChallengeCount).unwrap_or(0)
    }
}

mod test;
