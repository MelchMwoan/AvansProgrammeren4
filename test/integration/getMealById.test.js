const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Get Meal By Id UC-304', function () {
    it('TC-304-1-MealDoesNotExist', (done) => {
        //Testing for getting meal by id that does not exist
        chai.request(server).get("/api/meal/9999").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Mealdata-endpoint: Not Found, Meal with ID #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-304-2-SuccesfullyGettingMealDetailsThroughId', (done) => {
        //Testing for getting meal details with a valid Id
        chai.request(server).get("/api/meal/1").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("Mealdata-endpoint");
            data.should.be.an("object");
            data.should.have.keys("id", "name", "description", "price", "isActive", "updateDate", "participants", "maxAmountOfParticipants", "isVega", "isVegan", "isToTakeHome", "imageUrl", "dateTime", "createDate", "cook", "allergenes");
            data.id.should.be.a("number").that.equal(1);
            data.name.should.be.a("string").that.equal("Pasta Bolognese met tomaat, spekjes en kaas");
            data.description.should.be.a("string").that.equal("Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!");
            data.price.should.be.a("number").that.equal(12.75);
            data.isActive.should.be.a("boolean").that.equal(true);
            data.updateDate.should.be.a("string");
            data.participants.should.be.a("array");
            if(data.participants.length > 0) {
                expect(data.participants.every(obj => {
                    expect(obj).to.have.all.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
                    obj.id.should.be.a("number");
                    obj.firstName.should.be.a("string");
                    obj.lastName.should.be.a("string");
                    obj.emailAddress.should.be.a("string");
                    obj.phoneNumber.should.be.a("string");
                    obj.street.should.be.a("string");
                    obj.city.should.be.a("string");
                    obj.isActive.should.be.a("boolean");
                    return obj.roles.should.be.an("string");
                })).to.be.true;
            }
            data.maxAmountOfParticipants.should.be.a("number").that.equal(4);
            data.isVega.should.be.a("boolean").that.equal(false);
            data.isVegan.should.be.a("boolean").that.equal(false);
            data.isToTakeHome.should.be.a("boolean").that.equal(true);
            data.imageUrl.should.be.a("string").that.equal("https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg");
            data.dateTime.should.be.a("string");
            data.createDate.should.be.a("string");
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
            data.allergenes.should.be.an("string").that.equal("gluten,lactose");
            done();
        })
    })
})