const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');
const newUser = {
    firstName: "TC-206-4",
    lastName: "TC-206-4",
    street:"teststreet",
    city:"testcity",
    isActive:false,
    emailAddress:"t.TC2064@UC206.nl",
    password:"Testpassword1!",
    phoneNumber:"06 12345678"
}

describe('Delete User By Id UC-206', function () {
    it('TC-206-1-UserDoesNotExist', (done) => {
        //Testing for deleting user that does not exist
        chai.request(server).delete("/api/user/9999").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Userdata Delete-endpoint: Not Found, User with ID #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-206-2-NotLoggedIn', (done) => {
        //Testing for deleting user without being logged in
        chai.request(server).delete("/api/user/1").end((err, res) => {
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
    it('TC-206-3-DeleterIsNotOwnerOfData', (done) => {
        //Testing for deleting user details with Id without being owner
        chai.request(server).delete("/api/user/2").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.equal("Userdata Delete-endpoint: Forbidden, you are not the owner of the account with id #2");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-206-4-UserSuccesfullyDeleted', (done) => {
        //Testing for deleting user details with Id
        chai.request(server).post("/api/user").send(newUser).end((err, res) => {
            const id = res.body.data.id;
            chai.request(server).delete(`/api/user/${id}`).set('Authorization', "Bearer " + jwt.sign({userId: id}, process.env.JWTSECRETKEY)).end((err, res) => {
                res.body.should.be.an("object");
                res.body.should.have.keys("status", "message", "data");
                let { data, message, status } = res.body;
                status.should.equal(200)
                message.should.be.a("string").that.equal(`Gebruiker met ID ${id} is verwijderd`);
                data.should.be.an("object");
                data.should.be.empty;
                done();
            })
        })
    })
})