const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const dbconnection = require('../../src/utils/mysql-db.js');
const getUserJson = {
    token: "validtoken"
}

describe('Get User Profile UC-203', function () {
    it('TC-203-1-InvalidToken', (done) => {
        //Testing for getting profile with an invalid token
        //TODO: implement token check
        let json = getUserJson;
        json.token = "invalidtoken"
        chai.request(server).get("/api/user/profile").send(json).end((err, res) => {
            done();
        })
    })
    it('TC-203-2-SuccesfullGettingProfile', (done) => {
        //Testing for succesfully getting profile
        chai.request(server).get("/api/user/profile").send(getUserJson).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Profile-endpoint");
            data.should.be.an("object");
            // data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber");
            data.should.be.empty;
            done();
        })
    })
    it('TC-203-3-GettingProfileWithoutToken', (done) => {
        //Testing for getting profile without an token
        chai.request(server).get("/api/user/profile").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(401)
            message.should.be.a("string").that.contains("Profile-endpoint: Unauthorized, \"token\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
})