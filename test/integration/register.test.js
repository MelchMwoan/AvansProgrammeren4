const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('Register UC-201', function () {
    it('TC-201-1-InputMissing', (done) => {
        //Testing for register with missing phoneNumber
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAddress=test@test.nl&password=test1!").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-2-InvalidEmail', (done) => {
        //Testing for register with invalid email
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAddress=invalid&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-3-InvalidPassword', (done) => {
        //Testing for register with invalid password
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAddress=test@test.nl&password=invalid&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-4-UserAlreadyExists', (done) => {
        //Testing for already existing user (email=henk.jan@mail.nl)
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAddress=henk.jan@mail.nl&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.contains("Register-endpoint: Forbidden");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-5-SuccesfullRegistration', (done) => {
        //Testing for succesfull registration
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAddress=test@test.nl&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(201)
            message.should.be.a("string").that.contains("Register-endpoint: Created");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber");
            let { isActive } = data;
            chai.expect(["true", "false"]).to.include(isActive);
            done();
        })
    })
})