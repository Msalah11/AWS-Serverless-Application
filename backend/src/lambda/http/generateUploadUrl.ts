import 'source-map-support/register'
import {generateUploadUrl, getToDoAttachment, createAttachment, updateItemAttachment} from "../../logic/TODO";
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // DONE: Return a presigned URL to upload a file for an item with the provided id
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    const todoId = event.pathParameters.todoId;

    const URL = await generateUploadUrl(todoId);
    const attachmentId = uuid.v4();

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
    await updateItemAttachment(todoId, `https://udacity-project-serverless-application-dev.s3.amazonaws.com/${attachmentId}`, jwtToken);
    return newAttachment;
}
