# Share-a-Meal API
### Avans HBO Informatica - 1.4 Programmeren 4 -=- Melchior Willenborg - 2205378
---


This is an API which is used to create the backend of the Share-a-Meal application.

## Requirements for installation
---
You need a couple of things before you are able to install and launch the API:
- A [GitHub account](https://github.com/), this is used to download the source code.
- A device which has the following installed:
    - [Node.js](https://nodejs.org/), this is required to use NPM
    - [NPM](https://npmjs.com/), this is required to launch and install the API on your device
- *(optional) A MySQL database of your own, you could use the default MySQL database provided by me. However if you want to, you could also use a database of your own. You should put the settings of your own database in the .env file (see [Installation step 5.](#installation))*

## Installation
---
To install this API and run it on your own device complete the following steps for Windows:
1. Download the source code. Go to the [main branch](https://github.com/MelchMwoan/AvansProgrammeren4) and click on the green button that says "Code". You'll see a dropdown that includes the button "Download ZIP", click on this button and GitHub will automatically start the download.
2. Once downloaded, unpack the .zip in a folder of choice.
3. Open the new folder and right click anywhere in the folder. You'll see a menu which includes the option open in Terminal, click on this option. A new Terminal will open with the right directory.
4. Run `npm install`, this will install all the required packages automatically.
5. Configure your settings if you want to:
    - Create a .env file in the root folder (same folder of app.js and config.json)
    - Paste the following data in the .env file:
    ```javascript
    API_PORT=3000
    MYSQL_HOST=db-mysql-ams3-46626-do-user-8155278-0.b.db.ondigitalocean.com
    MYSQL_USER=2205378
    MYSQL_DATABASE=2205378
    MYSQL_PORT=25060
    MYSQL_PASSWORD=SAM123!
    ```
    - Change the values to your own mysql database settings or keep the default settings
6. Run `node app.js`, this will start the API.

Congratulations! You now have the API running on your local device.

## Examples
---
### Succesfull Deployment
This API is already succesfully deployed [here](https://long-route-production.up.railway.app/). You can try and check it out!
*See all available routes [here](https://documenter.getpostman.com/view/25891505/2s93eZxr1P).*

### Android Application
In periode 1.3 of Avans HBO Informatica we created an android application using an API with the same functionalities:

//TODO: add images

### WebApp
There also is a webapp created by a teacher which uses an API with the same functionalitites:

//TODO: add images

## What's New
---
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
- *WIP*