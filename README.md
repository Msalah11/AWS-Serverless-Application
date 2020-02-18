# Serverless TODO

A simple TODO application using AWS Lambda and Serverless framework.

# Functionality of the application

This appliation will allow to create/remove/update/get TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created. 

# Lambda Functions

* `Auth` - this function implement a custom authorizer for API Gateway.
* `GetTodos` - return all TODOs for a current user. 
* `CreateTodo` - create a new TODO for a current user.
* `UpdateTodo` - update a TODO item created by a current user.
* `DeleteTodo` - delete a TODO item created by a current user.
* `GenerateUploadUrl` - a presigned url that can be used to upload an attachment file for a TODO item. 

All functions are already connected to appriate events from API gateway

An id of a user can be extracted from a JWT token passed by a client

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.
