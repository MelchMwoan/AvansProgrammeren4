const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Update Meal UC-302', function () {
    it('TC-302-1-MissingRequiredField', (done) => {
        //Testing for updating meal with missing required field
        let meal = {
            name: "Pasta",
            // price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).put("/api/meal/1").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Mealdata Update-endpoint: Bad Request, \"price\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-302-2-NotLoggedIn', (done) => {
        //Testing for updating meal without being logged in
        let meal = {
            name: "Pasta",
            price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).put("/api/meal/1").send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(401)
            message.should.be.a("string").that.equal("Authentication-endpoint: Not Authorized, \"authorization\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-302-3-NotOwnerOfMeal', (done) => {
        //Testing for updating meal without being the owner of the meal
        let meal = {
            name: "Pasta",
            price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).put("/api/meal/2").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.equal("Mealdata Update-endpoint: Forbidden, you are not the cook of the meal with id #2");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-302-4-MealDoesNotExist', (done) => {
        //Testing for updating meal that does not exist
        let meal = {
            name: "Pasta",
            price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).put("/api/meal/9999").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Mealdata Update-endpoint: Not Found, Meal with id #9999 does not exist");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-302-5-UpdateMealSuccesfully', (done) => {
        //Testing for updating meal succesfully
        let meal = {
            name: "Pasta",
            description: "Pasta with tomato sauce",
            price: 5.50,
            maxAmountOfParticipants: 5,
            dateTime: "2021-05-05T18:00:00.000Z",
            imageUrl: "https://images.food52.com/8kJ4moklcq55uy3Qw2LTnxqCQP8=/1200x1200/c0c6aec8-e771-4c84-88fb-3aba6448d553--Pasta.jpg"
        }
        chai.request(server).post("/api/meal").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).then((res) => {
            let mealId = res.body.data.id;
            let updateMeal = {
                name: "Pasta",
                price: 7.50,
                maxAmountOfParticipants: 3,
                isVega: true
            }
            chai.request(server).put("/api/meal/" + mealId).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(updateMeal).end((err, res) => {
                res.body.should.be.an("object");
                res.body.should.have.keys("status", "message", "data");
                let { data, message, status } = res.body;
                status.should.equal(200)
                message.should.be.a("string").that.equal(`Mealdata Update-endpoint: Meal with Id #${mealId} was succesfully updated`);
                data.should.be.an("object");
                data.should.have.keys("id", "name", "description", "price", "maxAmountOfParticipants", "isActive", "allergenes", "cook", "createDate", "dateTime", "imageUrl", "isToTakeHome", "isVega", "isVegan", "participants", "updateDate");
                data.id.should.be.a("number");
                data.name.should.be.a("string").that.equal("Pasta");
                data.description.should.be.a("string").that.equal("Pasta with tomato sauce");
                data.price.should.be.a("number").that.equal(7.50);
                data.maxAmountOfParticipants.should.be.a("number").that.equal(3);
                data.isActive.should.be.a("boolean").that.equal(true);
                data.allergenes.should.be.an("string").that.is.empty;
                data.cook.should.be.an("object");
                data.cook.should.have.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
                data.cook.id.should.be.a("number").that.equal(1);
                data.cook.firstName.should.be.a("string").that.equal("Mariëtte");
                data.cook.lastName.should.be.a("string").that.equal("van den Dullemen");
                data.cook.emailAddress.should.be.a("string").that.equal("m.vandullemen@server.nl")
                data.cook.phoneNumber.should.be.a("string").that.equal("06-12345678");
                data.cook.street.should.be.a("string").that.equal("");
                data.cook.city.should.be.a("string").that.equal("Breda");
                data.cook.isActive.should.be.a("boolean").that.equal(true);
                data.cook.roles.should.be.an("string").that.is.empty;
                data.createDate.should.be.a("string");
                data.dateTime.should.be.a("string").that.equal("2021-05-05T18:00:00.000Z");
                data.imageUrl.should.be.a("string").that.equal("https://images.food52.com/8kJ4moklcq55uy3Qw2LTnxqCQP8=/1200x1200/c0c6aec8-e771-4c84-88fb-3aba6448d553--Pasta.jpg");
                data.isToTakeHome.should.be.a("boolean").that.equal(false);
                data.isVega.should.be.a("boolean").that.equal(true);
                data.isVegan.should.be.a("boolean").that.equal(false);
                data.participants.should.be.an("array").that.is.empty;
                data.updateDate.should.be.a("string");
                chai.request(server).delete("/api/meal/" + mealId).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end();
                done();
            })
        })
    })
})