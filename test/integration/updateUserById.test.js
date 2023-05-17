const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Update User Details By Id UC-205', function () {
    it('TC-205-1-MissingEmail', (done) => {
        //Testing for updating user details with Id without providing an email
        chai.request(server).put("/api/user/3").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Bad Request, \"emailAddress\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-2-UpdaterIsNotOwnerOfData', (done) => {
        //Testing for updating user details with Id without being owner
        //TODO: Testing for ownership through token
        chai.request(server).put("/api/user/xxxx").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).end((err, res) => {
            done();
        })
    })
    it('TC-205-3-InvalidPhoneNumber', (done) => {
        //Testing for updating user details with Id with invalid phonenumber
        let updateValues = {
            emailAddress: "j.doe@server.com",
            phoneNumber: "310619410"
        }
        chai.request(server).put("/api/user/2").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Bad Request, \"310619410\" is not a valid phone number");
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
        chai.request(server).put("/api/user/8").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Not Found, User with id #8 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-5-NotLoggedIn', (done) => {
        //Testing for updating user details without being logged in
        //TODO: test for logged in
        chai.request(server).put("/api/user/xxxx").end((err, res) => {
            done();
        })
    })
    it('TC-205-6-SuccesfullyUpdatedUser', (done) => {
        //Testing for updating user details with Id that does exists
        let updateValues = {
            emailAddress: "m.vandullemen@server.nl",
            city: "Utrecht",
            lastName: "Kees"
        }
        chai.request(server).put("/api/user/1").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).send(updateValues).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: User with Id #1 was succesfully updated");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber", "roles");
            data.should.include({city:"Utrecht", lastName:"Kees"})
            updateValues.city = "Breda";
            updateValues.lastName = "van den Dullemen"
            chai.request(server).put("/api/user/1").set('Authorization', "Bearer " + jwt.sign({userId: 1}, process.env.jwtSecretKey)).send(updateValues).end()
            done();
        })
    })
})