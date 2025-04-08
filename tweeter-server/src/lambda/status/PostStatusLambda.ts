import { ItemRequest, TweeterResponse, StatusDto } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

let sqsClient = new SQSClient();

async function sendMessage(jsonItem: string): Promise<void> {
  const sqs_url =
    "https://sqs.us-east-2.amazonaws.com/438465152124/TweeterPostStatusQ";
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

export const handler = async (
  request: ItemRequest<StatusDto>
): Promise<TweeterResponse> => {
  await new StatusService(new DynamoDBDAOFactory()).postStatus(
    request.token,
    request.item
  );

  //Send item as JSON to the SQS queue!
  const jsonItem = JSON.stringify(request.item);
  await sendMessage(jsonItem);

  return {
    success: true,
    message: null,
  };
};
