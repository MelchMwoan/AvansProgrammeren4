# Share-a-Meal API
### Avans HBO Informatica - 1.4 Programmeren 4 <br> Melchior Willenborg / 2205378
---
This is an API which is used to create the backend of a Share-a-Meal application. 
<br>This was an assignment for Avans HBO Informatica Programming 4.

# Table of Contents
- [Getting Started](#getting-started---back-to-top-)
    - [Requirements](#requirements)
    - [Installation](#installation)
- [Usage](#usage---back-to-top-)
    - [Example Deployment](#example-deployment)
    - [Authentication](#authentication)
    - [Request Format](#request-format)
    - [Response Format](#response-format)
    - [Routes](#routes)
- [What's New](#whats-new---back-to-top-)

# Getting Started <br> <p style="font-size: 0.5em"> [Back to top](#share-a-meal-api) </p>
Here is a simple instruction on how to install this API and run it on your own devices
## Requirements
You need a couple of things before you are able to install and launch the API:
- A [GitHub account](https://github.com/), this is used to download the source code.
- A device which has the following installed:
    - [Node.js](https://nodejs.org/), this is required to use NPM
    - [NPM](https://npmjs.com/), this is required to launch and install the API on your device
- A MySQL database of your own. This is required to actually store the users and meals.
<br>*To make sure your database uses the right db structure, run the `share-a-meal.sql` script in the database, this will create the right tables and relations. And it will also provide some dummy data.*

## Installation
To install this API and run it on your own device complete the following steps for Windows:
1. Download the source code. Go to the [main branch](https://github.com/MelchMwoan/AvansProgrammeren4) and click on the green button that says "Code". You'll see a dropdown that includes the button "Download ZIP", click on this button and GitHub will automatically start the download.
2. Once downloaded, unpack the .zip in a folder of choice.
3. Open the new folder and right click anywhere in the folder. You'll see a menu which includes the option open in Terminal, click on this option. A new Terminal will open with the right directory.
4. Run `npm install`, this will install all the required packages automatically.
5. Configure your settings:
    1. Create a .env file in the root folder (same folder of app.js and config.json)
    2. Paste the following data in the .env file:
    ``` json
    API_PORT="xxxx" //The port the API will be listening to, by default 3000
    MYSQL_HOST="xxxx" //The hostadress of your MySql databaseserver, by default localhost
    MYSQL_USER="xxxx" //The MySql username which is used to log into your databaseserver, by default root
    MYSQL_DATABASE="xxxx" //The actual name of the sharemeal database on your databaseserver, by default shareameal
    MYSQL_PORT="xxxx" //The port your MySql databaseserver is listening to, by default 3306
    MYSQL_PASSWORD="xxxx" //The password connected with the MYSQL_USER, if your MySql server does not use a password remove this variable
    jwtSecretKey="xxxx" //The key you use for the authentication system (unique code)
    ```
    3. Change the values to your own mysql database settings
6. Run `node app.js` in the still open Terminal, this will start the API.
<br> All of the logging that happens in the API will also show up in this same Terminal window.

Congratulations! You now have the API running on your local device.

# Usage <br> <p style="font-size: 0.5em"> [Back to top](#share-a-meal-api) </p>
## Example Deployment
The API is already running and reachable [here](https://share-a-meal.melchmwoan.com). You can test all features and all routes are fully functional. Go ahead and try it out!

## Authentication
Some of the routes require you to give authorization. You can find which ones do and which ones don't at [routes](#routes). Every request which has a ✔ at Token Required needs you to give authorization. To do this, follow these steps:
1. If you don't have an useraccount yet, create one with a `POST /api/register` request.
2. Once you know your login credentials (email and password), login with a `POST /api/login` request.
<br>You'll get a token in the response, this is the token you can use to give yourself authorization. 
3. On every request that needs authorization, you'll need to provide your token so the API knows who is creating the request. Do this by creating a Header called `Authorization`, and the value of this Header should be `Bearer YOUR_TOKEN` where YOUR_TOKEN is the token you just received.
## Request Format
Some of the routes will require you to deliver some data. An example is the `POST /api/register` route. To register an user, the API will need to know the user's name, email, password, etc.
<br>All this required data needs to be delivered through the Request body.

The best way to do this is to create a JSON in the Request Body which contains all required keys with your values. Here's an example of a Request Body for the `POST /api/register` request:
```json
{
    "firstName": "testfirst",
    "lastName": "testlast",
    "street":"teststreet",
    "city":"testcity",
    "isActive":false,
    "emailAddress":"t.est@test.nl",
    "password":"Test123!",
    "phoneNumber":"06 12345678"
}
```

## Response Format
Every response you'll get from the API will always use the same format. This format contains 3 components, the HTML statuscode, a information giving message and the actual responsedata.
You'll always receive a corresponding HTML code *Explanation for all codes can be found [here](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)*.
<br>If your request is <span style="color:green">correct</span>, the message will contain a success message and the data will be filled with the right data.
<br>If your request is <span style="color:red">faulty</span>, the message will contain a error message explaining what went wrong and the data will be empty.
<br>Example of a <span style="color:green">success response</span> of <span style="color:green">GET</span> /api/info:
```json
{
    "status": 200,
    "message": "Server Info-endpoint",
    "data": {
        "studentName": "Melchior Willenborg",
        "studentNumber": 2205378,
        "description": "Dit is de ShareAMeal API voor programmeren 4"
    }
}
```
Example of a <span style="color:red">failure response</span> of <span style="color:green">GET</span> /api/profile:
```json
{
    "status": 401,
    "message": "Authentication-endpoint: Not Authorized, \"authorization\" is required",
    "data": {}
}
```
## Routes
This API supports multiple routes to affect the data. 
*All routes are also visible in PostMan [here](https://documenter.getpostman.com/view/25891505/2s93eZxr1P).*
<br> All routes are split across multiple categories:
Category | Route | Token Required | Function
--- | --- | --- | ---
General | <span style="color:green">GET</span> /api/info | ❌ | Get general information of the API
Users | <span style="color:yellow">POST</span> /api/register | ❌ | Create a new account to use across the whole API, this is necessary to be able to login and generate a token.
Users | <span style="color:yellow">POST</span> /api/login | ❌ | Login an existing account by using the emailAddress and the password connected. When credentials met, you'll receive a token which is usable across the other routes.
Users | <span style="color:green">GET</span> /api/user | ✔ | Get an overview of all existing users in the database.
Users | <span style="color:green">GET</span> /api/user?filter1=state&filter2=... | ✔ | Get an overview of all existing users in the database that apply to the given filters.
Users | <span style="color:green">GET</span> /api/user/profile | ✔ | Get your own profile.
Users | <span style="color:green">GET</span> /api/user/:userId | ✔ | Get user info about the user with given id.
Users | <span style="color:red">DELETE </span>/api/user/:userId | ✔ | Delete user account of the user with given id, only works if your the owner of given userId.
Users | <span style="color:blue">PUT</span> /api/user/:userId | ✔ | Update user data of the user with given id, only works if your the owner of given userId.
Meals | <span style="color:yellow">POST</span> /api/meal | ✔ | Create a new meal.
Meals | <span style="color:green">GET</span> /api/meal | ❌ | Get an overview of all existing meals.
Meals | <span style="color:blue">PUT</span> /api/meal/:mealId | ✔ | Update the meal corresponding with given Id, you need to be the cook of the meal!
Meals | <span style="color:green">GET</span> /api/meal/:mealId | ❌ | Get the meal corresponding with given Id.
Meals | <span style="color:red">DELETE</span> /api/meal/:mealId | ✔ | Delete the meal corresponding with given Id, you need to be the cook of the meal!
Registrations | <span style="color:yellow">POST</span> /api/meal/:mealId/participate | ✔ | Create a participation to the meal corresponding to the give mealId.
Registrations | <span style="color:red">DELETE</span> /api/meal/:mealId/participate | ✔ | Deletes your participation to the meal corresponding to the give mealId.
Registrations | <span style="color:green">GET</span> /api/meal/:mealId/participants | ✔ | Gets every users that has a registration for the corresponding meal, only the cook can do this!
Registrations | <span style="color:green">GET</span> /api/meal/:mealId/participants/:participantId | ✔ | Gets the user details of the corresponding user that has a registration for the corresponding meal, only the cook can do this!

# What's New <br> <p style="font-size: 0.5em"> [Back to top](#share-a-meal-api) </p>
The API gets updates quite recently so below you'll find a summary of the changes between versions:
### - Tussenresultaat 1:
- API Routes for use cases UC-201 -> UC-206 + UC-101
- Testcases for routes stated above
- In-Memory database by using an array containing all POST, GET, PUT and DELETE functionality of the declared API Routes
- Clear terminal logger for developers
### - Tussenresultaat 2:
- Usage of a MySQL Database instead of an In-Memory database
- Updated API routes for use cases UC-201 -> UC-206
- Simple Error Handling
- Environmental Configurations
- Updated testcases for declared API Routes
- Improved input validation through NPM Joi package
- Refactored Folder Structure
- Online deployment of MySQL db and API
### - Eindopdracht:
- Bugfixes
- Added all routes for Meals
- Added all routes for Participations
- Updated all tests for Users
- Created all tests for Meals
- Created all tests for Participations
- Added Register and Login functionality
- Added Authentication through tokens
- Added Password encryption
- Updated README