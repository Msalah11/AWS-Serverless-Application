import 'source-map-support/register'
import {generateUploadUrl, getToDoAttachment, createAttachment, updateItemAttachment} from "../../logic/TODO";
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

const s3BucketName = process.env.S3_BUCKET_NAME
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // DONE: Return a presigned URL to upload a file for an item with the provided id
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const todoId = event.pathParameters.todoId;

    const attachmentId = uuid.v4();
    const URL = await generateUploadUrl(attachmentId);

    const newItem = await createAttachmentItem(todoId, attachmentId, event, jwtToken);
    const Attachments = await getToDoAttachment(todoId);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            uploadUrl: URL,
            attachmentUrl: Attachments,
            newItem: newItem
        })
    };
};

async function createAttachmentItem(todoId: string, attachmentId: string, event: any, jwtToken: string) {
    const newAttachment = await createAttachment(todoId, attachmentId, event, jwtToken);
    const attachmentURL = `${s3BucketName}.s3.amazonaws.com/${attachmentId}`;
    await updateItemAttachment(todoId, attachmentURL, jwtToken);
    return newAttachment;
}
