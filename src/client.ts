import { IChallenge, IChallengeResponse } from './models';
import { Profile } from '@paladin-privacy/profiles';

export class PaladinAuthenticationClient {
  public static signChallenge(
    user: Profile,
    challenge: IChallenge
  ): IChallengeResponse {
    return {
      challenge,
      signature: user.getKeychain().sign(JSON.stringify(challenge)).signature,
    };
  }
}
