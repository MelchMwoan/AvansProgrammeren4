const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
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
        chai.request(server).get("/api/user/9999").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).end((err, res) => {
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
        chai.request(server).get("/api/user/3").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Userdata-endpoint: User info for #3");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "phoneNumber", "roles");
            data.id.should.be.a("number").that.equal(3);
            data.firstName.should.be.a("string").that.equal("Herman");
            data.lastName.should.be.a("string").that.equal("Huizinga");
            data.street.should.be.a("string").that.equal("");
            data.city.should.be.a("string").that.equal("");
            data.isActive.should.be.a("boolean").that.equal(true);
            data.emailAddress.should.be.a("string").that.equal("h.huizinga@server.nl");
            data.phoneNumber.should.be.a("string").that.equal("06-12345678");
            data.roles.should.be.an("string").that.equal("editor,guest");
            done();
        })
    })
})