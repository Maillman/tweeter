import { StatusDto } from "tweeter-shared";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";
import { Story } from "../../model/entity/Story";
import { FollowService } from "../../model/service/FollowService";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

let sqsClient = new SQSClient();

async function sendMessage(jsonItem: string): Promise<void> {
  const sqs_url =
    "https://sqs.us-east-2.amazonaws.com/438465152124/TweeterUpdateFeedQ";
  const messageBody = jsonItem;
  console.log(sqs_url, messageBody);

  const params = {
    DelaySeconds: 10,
    MessageBody: messageBody,
    QueueUrl: sqs_url,
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Success, message sent. MessageID:", data.MessageId);
  } catch (err) {
    throw err;
  }
}

export const handler = async function (event: any) {
  for (let i = 0; i < event.Records.length; ++i) {
    const { body } = event.Records[i];
    const status: StatusDto = JSON.parse(body);
    const userAlias: string = status.user.alias;
    let hasMoreFollowers = true;
    let lastFollower: string | undefined = undefined;
    do {
      const [numberOfFollowers, hasMore] = await new FollowService(
        new DynamoDBDAOFactory()
      ).getNumberOfFollowers(
        userAlias,
        100,
        lastFollower === undefined ? null : lastFollower
      );
      const body = {
        status: status,
        numberOfFollowers: numberOfFollowers,
      };
      const jsonItem = JSON.stringify(body);
      await sendMessage(jsonItem);
      hasMoreFollowers = hasMore;
      lastFollower = numberOfFollowers.at(-1);
    } while (hasMoreFollowers);
  }
};
