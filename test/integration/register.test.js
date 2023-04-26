const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const dbconnection = require('../../src/utils/mysql-db.js');

describe('Register UC-201', function () {
    it('TC-201-1-InputMissing', (done) => {
        //Testing for register with missing phoneNumber
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=test@test.nl&password=test1!").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request, \"phoneNumber\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-2-InvalidEmail', (done) => {
        //Testing for register with invalid email
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=invalid&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request, \"emailAdress\" must be a valid email");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-3-InvalidPassword', (done) => {
        //Testing for register with invalid password
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=test@test.nl&password=invalid&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.contains("Register-endpoint: Bad Request, \"invalid\" is not a valid password (at least 1 number and 1 special character, 6-16 characters)");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-4-UserAlreadyExists', (done) => {
        //Testing for already existing user (email=henk.jan@mail.nl)
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=j.doe@server.com&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.contains("Register-endpoint: Forbidden, user with email: 'j.doe@server.com' already exists");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-5-SuccesfullRegistration', (done) => {
        //Testing for succesfull registration
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=test@test.nl&password=test1!&phoneNumber=31636363655").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(201)
            message.should.be.a("string").that.contains("Register-endpoint: Created, succesfully created a new user");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAdress", "password", "phoneNumber", "roles");
            let { isActive, id } = data;
            chai.expect([1,0]).to.include(isActive);
            chai.request(server).delete(`/api/user/${id}?token=randomtoken`).end()
            done();
        })
    })
})