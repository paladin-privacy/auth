import {
  Keychain,
  Profile,
  Fields,
  Visibility,
} from '@portable-profiles/profiles';
import { PaladinAuthenticationServer } from '../server';
import { PaladinAuthenticationClient } from '../client';

// Initialize a profile
const alice = new Profile();
alice.initialize();
alice.setField(Fields.Nickname, 'Alice', Visibility.Public);
alice.sign();

test('verify successful authentication', () => {
  // Initialize the mock server keychain
  const server = Keychain.create();

  // Execute auth flow
  const challenge = PaladinAuthenticationServer.challenge(server, alice);
  const challengeResponse = PaladinAuthenticationClient.signChallenge(
    alice,
    challenge
  );
  const session = PaladinAuthenticationServer.authenticate(
    server,
    alice,
    challengeResponse
  );

  // Verify the session
  expect(PaladinAuthenticationServer.verifySession(session, server)).toEqual(
    alice.getId()
  );
});

test('attempt to forge the challenge in a response', () => {
  // Initialize the mock server keychain
  const server = Keychain.create();

  // Execute auth flow
  const challenge = PaladinAuthenticationServer.challenge(server, alice);
  expect(() => {
    const challengeResponse = PaladinAuthenticationClient.signChallenge(
      alice,
      challenge
    );
    challengeResponse.challenge.body.id = 'test';
    PaladinAuthenticationServer.authenticate(server, alice, challengeResponse);
  }).toThrow();
});

test('attempt to forge the signature in a response', () => {
  // Initialize the mock server keychain
  const server = Keychain.create();

  // Execute auth flow
  const challenge = PaladinAuthenticationServer.challenge(server, alice);
  expect(() => {
    const challengeResponse = PaladinAuthenticationClient.signChallenge(
      alice,
      challenge
    );
    challengeResponse.signature = 'test';
    PaladinAuthenticationServer.authenticate(server, alice, challengeResponse);
  }).toThrow();
});

test('attempt to forge a session', () => {
  // Initialize the mock server keychain
  const server = Keychain.create();

  // Execute auth flow
  expect(() => {
    expect(
      PaladinAuthenticationServer.verifySession(
        {
          body: {
            id: 'test',
            expire: 0,
          },
          signature: 'test_signature',
        },
        server
      )
    ).toEqual(alice.getId());
  }).toThrow();
});
