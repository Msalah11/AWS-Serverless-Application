import * as AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {Types} from 'aws-sdk/clients/s3';
import {TodoItem} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";

export class ToDoAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({signatureVersion: 'v4'}),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly attachmentTable = process.env.ATTACHMENT_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    async getAllToDo(userId: string): Promise<TodoItem[]> {
        console.log("Getting all todo");

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[]
    }

    async getToDo(todoId: string) {
        console.log("Getting Todo By todoId");

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            },
            ScanIndexForward: false
        };

        const result = await this.docClient.query(params).promise();
        console.log('Getting Todo By todoId fetched');
        const items = result.Items;

        return items[0];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo");

        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
    };

    async createAttachment(item) {
        console.log("Creating new Attachment todo");
        const attachmentItem = {
            ...item,
            attachmentUrl: `https://${this.s3BucketName}.s3.amazonaws.com/${item.attachmentId}`
        };
        const params = {
            TableName: this.attachmentTable,
            Item: attachmentItem,
        };

        await this.docClient.put(params).promise();

        return attachmentItem as TodoItem;
    }

    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        console.log("Updating todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    };

    async updateToDoAttachment(todoId, attachmentUrl, userId): Promise<TodoItem> {
        console.log('start update todo to add attachment');
        const item = await this.getToDo(todoId);
        const updatedItem = {
            todoId: todoId,
            userId: userId,
            createdAt: item.createdAt,
            name: item.name,
            dueDate:item.dueDate,
            done: item.done,
            attachmentUrl: attachmentUrl
        };
        console.log('updatedItem', updatedItem);
        await this.docClient.put({
            TableName: this.todoTable,
            Item: updatedItem
        }).promise();
        console.log("upload completed!");

        return updatedItem as TodoItem;
    };

    async deleteToDo(todoId: string, userId: string): Promise<string> {
        console.log("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        console.log("Generating URL");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        console.log(url);

        return url as string;
    }

    async getAttachment(todoId: string) {

        const params = {
            TableName: this.attachmentTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            },
            ScanIndexForward: false
        };

        const result = await this.docClient.query(params).promise();
        console.log(result);
        return result.Items;
    }
}
