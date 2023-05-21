const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Resign from meal UC-402', function () {
    it('TC-402-1-NotLoggedIn', (done) => {
        //Testing for resign from meal without being logged in
        chai.request(server).delete("/api/meal/1/participate").end((err, res) => {
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
    it('TC-402-2-MealDoesNotExist', (done) => {
        //Testing for resign from meal that does not exist
        chai.request(server).delete("/api/meal/9999/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Meal Participate-endpoint: Not Found, Participation with meal id #9999 and user id #1 does not exist");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-402-3-ParticipationDoesNotExist', (done) => {
        //Testing for resign from meal that does not exist
        chai.request(server).delete("/api/meal/1/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 9999 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Meal Participate-endpoint: Not Found, Participation with meal id #1 and user id #9999 does not exist");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-402-4-ResignFromMeal', (done) => {
        //Testing for resign from meal that does not exist
        chai.request(server).post("/api/meal/1/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            chai.request(server).delete("/api/meal/1/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
                res.body.should.be.an("object");
                res.body.should.have.keys("status", "message", "data");
                let { data, message, status } = res.body;
                status.should.equal(200)
                message.should.be.a("string").that.equal("User met ID 1 is afgemeld voor maaltijd met ID 1");
                data.should.be.an("object");
                data.should.have.keys("user", "meal");
                let { user, meal } = data;
                user.should.be.an("object");
                user.should.have.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
                meal.should.be.an("object");
                meal.should.have.keys("id", "name", "description", "price", "isActive", "updateDate", "participants", "maxAmountOfParticipants", "isVega", "isVegan", "isToTakeHome", "imageUrl", "dateTime", "createDate", "cook", "allergenes");
                meal.participants.should.be.an("array")
                chai.expect(meal.participants).to.not.deep.include(user);
                done();
            })
        })
    })
})