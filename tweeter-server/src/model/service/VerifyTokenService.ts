import { SessionsDAO } from "../dao/SessionsDAO";

export class VerifyTokenService {
  public static async verifyToken(
    sessionsDAO: SessionsDAO,
    token: string
  ): Promise<void> {
    const authToken = await sessionsDAO.getAuthToken(token);
    console.log(authToken);
    if (authToken === undefined)
      throw new Error("[Bad Request] bad token, please log back in");
    const now = Date.now();
    if (authToken.timestamp + 90 * 60 * 1000 < now) {
      await sessionsDAO.deleteAuthToken(token);
      throw new Error("[Bad Request] session expired");
    }
    console.log(token, now);
    await sessionsDAO.updateAuthToken(token, now);
  }
}
