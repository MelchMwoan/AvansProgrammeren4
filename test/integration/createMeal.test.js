const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Create Meal UC-301', function () {
    it('TC-301-1-MissingRequiredField', (done) => {
        //Testing for creating meal with missing required field
        let meal = {
            name: "Pasta",
            price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).post("/api/meal").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Create Meal-endpoint: Bad Request, \"description\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-301-2-NotLoggedIn', (done) => {
        //Testing for creating meal without being logged in
        let meal = {
            name: "Pasta",
            description: "Pasta with tomato sauce",
            price: 5.50,
            maxAmountOfParticipants: 5
        }
        chai.request(server).post("/api/meal").send(meal).end((err, res) => {
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
    it('TC-301-3-MealSuccesfullyCreated', (done) => {
        //Testing for creating meal succesfully
        let meal = {
            name: "Pasta",
            description: "Pasta with tomato sauce",
            price: 5.50,
            maxAmountOfParticipants: 5,
            dateTime: "2021-05-05T18:00:00.000Z",
            imageUrl: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bbcgoodfood.com%2Frecipes%2Fcollection%2Fpasta&psig=AOvVaw0QZ3Z4Z2Z4Z2Z4Z2Z4Z2Z4&ust=1619787226262000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCJjQ4ZqH4_ACFQAAAAAdAAAAABAD"
        }
        chai.request(server).post("/api/meal").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).send(meal).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(201)
            message.should.be.a("string").that.equal("Create Meal-endpoint: Created, succesfully created a new meal");
            data.should.be.an("object");
            data.should.have.keys("id", "name", "description", "price", "maxAmountOfParticipants", "isActive", "allergenes", "cook", "createDate", "dateTime", "imageUrl", "isToTakeHome", "isVega", "isVegan", "participants", "updateDate");
            data.id.should.be.a("number");
            data.name.should.be.a("string").that.equal("Pasta");
            data.description.should.be.a("string").that.equal("Pasta with tomato sauce");
            data.price.should.be.a("number").that.equal(5.50);
            data.maxAmountOfParticipants.should.be.a("number").that.equal(5);
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
            data.imageUrl.should.be.a("string").that.equal("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bbcgoodfood.com%2Frecipes%2Fcollection%2Fpasta&psig=AOvVaw0QZ3Z4Z2Z4Z2Z4Z2Z4Z2Z4&ust=1619787226262000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCJjQ4ZqH4_ACFQAAAAAdAAAAABAD");
            data.isToTakeHome.should.be.a("boolean").that.equal(false);
            data.isVega.should.be.a("boolean").that.equal(false);
            data.isVegan.should.be.a("boolean").that.equal(false);
            data.participants.should.be.an("array").that.is.empty;
            data.updateDate.should.be.a("string");
            chai.request(server).delete("/api/meal/" + data.id).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end();
            done();
        })
    })
})
