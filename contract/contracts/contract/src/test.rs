#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_init_and_create_challenge() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "Build a DApp on Stellar"),
        &String::from_str(&env, "Development"),
        &1000i128,
    );
    assert_eq!(id, 1);
    assert_eq!(client.get_challenge_count(), 1);
}

#[test]
fn test_join_challenge() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "Rust Soroban Tutorial"),
        &String::from_str(&env, "Coding"),
        &500i128,
    );

    client.join_challenge(&player, &id);
    let players = client.get_challenge_players(&id);
    assert_eq!(players.len(), 1);
    assert_eq!(players.get(0).unwrap(), player);

    let stats = client.get_player_stats(&player);
    assert_eq!(stats.challenges_joined, 1);
    assert_eq!(stats.challenges_won, 0);
}

#[test]
fn test_complete_challenge() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "Design a Tokenomics Model"),
        &String::from_str(&env, "DeFi"),
        &2000i128,
    );

    client.join_challenge(&player, &id);
    client.complete_challenge(&admin, &id, &player);

    let challenge = client.get_challenge(&id);
    assert_eq!(challenge.completed, true);
    assert_eq!(challenge.winner, Some(player.clone()));

    let stats = client.get_player_stats(&player);
    assert_eq!(stats.challenges_won, 1);
    assert_eq!(stats.xp, 100);
}

#[test]
fn test_multiple_players() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player1 = Address::generate(&env);
    let player2 = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "Hackathon Challenge"),
        &String::from_str(&env, "Build"),
        &3000i128,
    );

    client.join_challenge(&player1, &id);
    client.join_challenge(&player2, &id);

    let players = client.get_challenge_players(&id);
    assert_eq!(players.len(), 2);

    let challenge = client.get_challenge(&id);
    assert_eq!(challenge.player_count, 2);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_challenge_not_found() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    client.get_challenge(&999);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_duplicate_join() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test"),
        &100i128,
    );

    client.join_challenge(&player, &id);
    client.join_challenge(&player, &id); // should panic
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_complete_non_participant() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);
    client.init(&admin);

    let id = client.create_challenge(
        &admin,
        &String::from_str(&env, "X"),
        &String::from_str(&env, "Y"),
        &100i128,
    );

    client.complete_challenge(&admin, &id, &player); // player never joined
}

#[test]
fn test_player_stats_default() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let player = Address::generate(&env);
    let stats = client.get_player_stats(&player);
    assert_eq!(stats.xp, 0);
    assert_eq!(stats.challenges_won, 0);
    assert_eq!(stats.challenges_joined, 0);
}

#[test]
fn test_empty_challenge_count() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ZeroTheory, ());
    let client = ZeroTheoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);
    assert_eq!(client.get_challenge_count(), 0);
}
