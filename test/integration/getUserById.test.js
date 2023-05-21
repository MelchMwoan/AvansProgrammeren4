const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Get User Details By Id UC-204', function () {
    it('TC-204-1-InvalidToken', (done) => {
        //Testing for getting user details with invalid token
        chai.request(server).get("/api/user/3").set('Authorization', "Bearer " + jwt.sign({userId: 1}, 'invalidtoken')).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(401)
            message.should.be.a("string").that.equal("Verification-endpoint: Unauthorized, JsonWebTokenError: invalid signature");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-204-2-UserIdDoesNotExist', (done) => {
        //Testing for getting user details with a non-existent Id
        chai.request(server).get("/api/user/9999").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Userdata-endpoint: Not Found, User with ID #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-204-3-SuccesfullyGettingUserDetailsThroughId', (done) => {
        //Testing for getting user details with a valid Id
        chai.request(server).get("/api/user/3").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("Userdata-endpoint: User info for #3");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "phoneNumber", "roles", "upcomingMeals");
            data.id.should.be.a("number").that.equal(3);
            data.firstName.should.be.a("string").that.equal("Herman");
            data.lastName.should.be.a("string").that.equal("Huizinga");
            data.street.should.be.a("string").that.equal("");
            data.city.should.be.a("string").that.equal("");
            data.isActive.should.be.a("boolean").that.equal(true);
            data.emailAddress.should.be.a("string").that.equal("h.huizinga@server.nl");
            data.phoneNumber.should.be.a("string").that.equal("06-12345678");
            data.roles.should.be.an("string").that.equal("editor,guest");
            data.upcomingMeals.should.be.an("array");
            if (data.upcomingMeals.length > 0) {
                expect(data.upcomingMeals.every(obj => {
                    obj.should.have.keys("id", "name", "description", "price", "isActive", "updateDate", "maxAmountOfParticipants", "isVega", "isVegan", "isToTakeHome", "imageUrl", "dateTime", "createDate", "allergenes");
                    obj.id.should.be.a("number");
                    obj.name.should.be.a("string");
                    obj.description.should.be.a("string");
                    obj.price.should.be.a("number");
                    obj.isActive.should.be.a("boolean");
                    obj.updateDate.should.be.a("string");
                    obj.maxAmountOfParticipants.should.be.a("number");
                    obj.isVega.should.be.a("boolean");
                    obj.isVegan.should.be.a("boolean");
                    obj.isToTakeHome.should.be.a("boolean");
                    obj.imageUrl.should.be.a("string");
                    obj.dateTime.should.be.a("string");
                    obj.createDate.should.be.a("string");
                    return obj.allergenes.should.be.an("string");
                })).to.be.true;
            }
            done();
        })
    })
})