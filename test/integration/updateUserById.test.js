const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('Update User Details By Id UC-205', function () {
    it('TC-205-1-MissingEmail', (done) => {
        //Testing for updating user details with Id without providing an email
        chai.request(server).put("/api/user/3").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Bad Request, email is not provided");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-2-UpdaterIsNotOwnerOfData', (done) => {
        //Testing for updating user details with Id without being owner
        //TODO: Testing for ownership through token
        chai.request(server).put("/api/user/2?emailAddress=henk.jan@mail.nl").end((err, res) => {
            done();
        })
    })
    it('TC-205-3-InvalidPhoneNumber', (done) => {
        //Testing for updating user details with Id with invalid phonenumber
        chai.request(server).put("/api/user/2?emailAddress=henk.jan@mail.nl&phoneNumber=310619410").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Bad Request, phone number is not valid");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-205-4-UserDoesNotExist', (done) => {
        //Testing for updating user details with Id that does not exists
        chai.request(server).put("/api/user/8?emailAddress=henk.jan@mail.nl").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: Not Found, User with id #8 and email henk.jan@mail.nl not found");
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
        //Testing for updating user details with Id that does not exists
        chai.request(server).put("/api/user/1?emailAddress=henk.jan@mail.nl&city=Utrecht&lastName=Kees").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Userdata Update-endpoint: User with Id #1 was succesfully updated");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber");
            data.should.include({city:"Utrecht", lastName:"Kees"})
            done();
        })
    })
})