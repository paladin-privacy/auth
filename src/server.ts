import { PaladinKeychain, Profile } from '@paladin-privacy/profiles';
const crypto = require('crypto');
import * as moment from 'moment';
import { ISession, IChallenge, IChallengeResponse } from './models';

export class PaladinAuthenticationServer {
  public static challenge(
    serverKeychain: PaladinKeychain,
    userProfile: Profile
  ): IChallenge {
    const token = crypto.randomBytes(48).toString('base64');
    const body = { id: userProfile.getId(), token };
    const signature = serverKeychain.sign(JSON.stringify(body)).signature;
    return {
      body,
      signature,
    };
  }

  public static authenticate(
    serverKeychain: PaladinKeychain,
    userProfile: Profile,
    response: IChallengeResponse
  ): ISession {
    // Make sure that the challenge is valid
    if (
      !serverKeychain.verify(JSON.stringify(response.challenge.body), {
        signature: response.challenge.signature,
      })
    ) {
      throw new Error('The challenge is not properly signed by this server');
    }

    // Get the user and their keychain
    const userKeychain = userProfile.getKeychain();

    // Check that the challenge was signed
    if (
      !userKeychain.verify(JSON.stringify(response.challenge), {
        signature: response.signature,
      })
    ) {
      throw new Error('The challenge is not properly signed by the user');
    }

    return PaladinAuthenticationServer.createSession(
      serverKeychain,
      userProfile
    );
  }

  public static createSession(
    serverKeychain: PaladinKeychain,
    userProfile: Profile
  ): ISession {
    const id = userProfile.getId();
    const expire = moment().unix() + 86400 * 30;
    const body = { id, expire };
    const signature = serverKeychain.sign(JSON.stringify(body)).signature;
    return { body, signature };
  }

  public static verifySession(
    session: ISession,
    serverKeychain: PaladinKeychain
  ): string {
    if (
      !serverKeychain.verify(JSON.stringify(session.body), {
        signature: session.signature,
      })
    ) {
      throw new Error('The session is not properly signed by this server');
    }
    return session.body.id;
  }
}
