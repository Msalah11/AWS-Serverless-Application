import {TodoItem} from "../models/TodoItem";
import {ToDoAccess} from "../dataLayer/ToDoAccess";
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";

const uuidv4 = require('uuid/v4');
const toDoAccess = new ToDoAccess();

export async function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllToDo(userId);
}

export function createToDo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.createToDo({
        userId: userId,
        todoId: uuidv4(),
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}

export function createAttachment(todoId: string, attachmentId: string, event: any, jwtToken: string) {
    const timestamp = new Date().toISOString();
    const newAttach = JSON.parse(event.body);
    const newItem = {
        todoId,
        timestamp,
        attachmentId,
        userId: parseUserId(jwtToken),
        ...newAttach,
    };
    return toDoAccess.createAttachment(newItem);
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDo(todoId, userId);
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return toDoAccess.generateUploadUrl(todoId);
}

export function getToDoAttachment(todoId: string) {
    return toDoAccess.getAttachment(todoId);
}

export function updateItemAttachment(todoId: string, attachmentUrl: any, jwtToken: any) {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDoAttachment(todoId, attachmentUrl, userId);
}
