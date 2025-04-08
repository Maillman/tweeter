import { DynamoDBDAOFactory } from "../../model/dao/DynamoDBDAOs/DynamoDBDAOFactory";
import { StatusService } from "../../model/service/StatusService";

export const handler = async function (event: any) {
  for (let i = 0; i < event.Records.length; ++i) {
    const { body } = event.Records[i];
    const { status: status, numberOfFollowers: numberOfFollowers } =
      JSON.parse(body);
    console.log(status, numberOfFollowers);
    await new StatusService(new DynamoDBDAOFactory()).batchPostStatus(
      status,
      numberOfFollowers
    );
    console.log("Batch Post Status Successful!");
  }
};
