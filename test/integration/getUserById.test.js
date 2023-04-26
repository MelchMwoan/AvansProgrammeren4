const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('Get User Details By Id UC-204', function () {
    it('TC-204-1-InvalidToken', (done) => {
        //Testing for getting user details with Id with an invalid token
        //TODO: implement token check
        chai.request(server).get("/api/user/3?token=invalidToken").end((err, res) => {
            done();
        })
    })
    it('TC-204-2-UserIdDoesNotExist', (done) => {
        //Testing for getting user details with a non existent Id
        chai.request(server).get("/api/user/999?token=validToken").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.contains("Userdata-endpoint: Not Found, User with ID #999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-204-3-SuccesfullyGettingUserDetailsThroughId', (done) => {
        //Testing for getting user details with a existent Id
        chai.request(server).get("/api/user/3?token=validToken").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Userdata-endpoint: User info for #3");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAdress", "phoneNumber", "roles");
            done();
        })
    })
})