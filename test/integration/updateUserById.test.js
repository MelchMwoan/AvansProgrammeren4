const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Update User Details By Id UC-205', function () {
    it('TC-205-1-MissingEmail', (done) => {
        //Testing for updating user details with Id without email
        chai.request(server).put("/api/user/1").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Userdata Update-endpoint: Bad Request, \"emailAddress\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-2-UpdaterIsNotOwnerOfData', (done) => {
        //Testing for updating user details with Id without being owner
        chai.request(server).put("/api/user/2").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).send({emailAddress:"j.doe@server.com"}).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.equal("Userdata Update-endpoint: Forbidden, you are not the owner of the account with id #2");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-3-InvalidPhoneNumber', (done) => {
        //Testing for updating user details with Id with invalid phone number
        let updateValues = {
            emailAddress: "j.doe@server.com",
            phoneNumber: "1111"
        }
        chai.request(server).put("/api/user/2").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Userdata Update-endpoint: Bad Request, \"1111\" is not a valid phone number (starts with 06 and contains 10 digits in total)");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-4-UserDoesNotExist', (done) => {
        //Testing for updating user details with Id that does not exists
        let updateValues = {
            emailAddress: "u.notexists@server.com"
        }
        chai.request(server).put("/api/user/9999").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Userdata Update-endpoint: Not Found, User with id #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-5-NotLoggedIn', (done) => {
        //Testing for updating user details without being logged in
        let updateValues = {
            emailAddress: "m.vandullemen@server.nl",
            city: "Utrecht",
            lastName: "Kees"
        }
        chai.request(server).put("/api/user/1").send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(401)
            message.should.be.a("string").that.equal(`Authentication-endpoint: Not Authorized, "authorization" is required`);
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-6-SuccesfullyUpdatedUser', (done) => {
        //Testing for updating user details with Id succesfully
        let updateValues = {
            emailAddress: "m.vandullemen@server.nl",
            city: "Utrecht",
            lastName: "Kees",
            password: "Test1234"
        }
        chai.request(server).put("/api/user/1").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("Userdata Update-endpoint: User with Id #1 was succesfully updated");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber", "roles");
            data.id.should.be.a("number").that.equal(1);
            data.firstName.should.be.a("string").that.equal("Mariëtte");
            data.lastName.should.be.a("string").that.equal("Kees");
            data.street.should.be.a("string").that.equal("Lovensdijkstraat");
            data.city.should.be.a("string").that.equal("Utrecht");
            data.isActive.should.be.a("boolean").that.equal(true);
            data.emailAddress.should.be.a("string").that.equal("m.vandullemen@server.nl");
            data.password.should.be.a("string").that.equal(updateValues.password);
            data.phoneNumber.should.be.a("string").that.equal("06-12345678");
            data.roles.should.be.an("string").that.equal("guest");
            updateValues.city = "Breda";
            updateValues.lastName = "van den Dullemen"
            updateValues.password = "Secret123"
            chai.request(server).put("/api/user/1").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.JWTSECRETKEY)).send(updateValues).end((err, res) => {done()});
        })
    })
})