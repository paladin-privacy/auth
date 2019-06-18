export interface IChallengeBody {
  id: string;
  token: string;
}

export interface IChallenge {
  body: IChallengeBody;
  signature: string;
}

export interface ISessionBody {
  id: string;
  expire: number;
}

export interface ISession {
  body: ISessionBody;
  signature: string;
}

export interface IChallengeResponse {
  challenge: IChallenge;
  signature: string;
}
