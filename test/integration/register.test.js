const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Register UC-201', function () {
    it('TC-201-1-RequiredFieldMissing', (done) => {
        //Testing for register with missing phoneNumber
        const registerJson = {
            firstName: "TC-201-1",
            lastName: "TC-201-1",
            street: "teststreet",
            city: "testcity",
            emailAddress: "t.TC2011@UC201.nl",
            password: "Testpassword1!"
        }
        chai.request(server).post("/api/user").send(registerJson).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Register-endpoint: Bad Request, \"phoneNumber\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-2-InvalidEmail', (done) => {
        //Testing for register with invalid email
        const registerJson = {
            firstName: "TC-201-2",
            lastName: "TC-201-2",
            street: "teststreet",
            city: "testcity",
            emailAddress: "invalid",
            password: "Testpassword1!",
            phoneNumber: "06-12345678"
        }
        chai.request(server).post("/api/user").send(registerJson).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Register-endpoint: Bad Request, \"emailAddress\" must be a valid email");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-3-InvalidPassword', (done) => {
        //Testing for register with invalid password
        const registerJson = {
            firstName: "TC-201-3",
            lastName: "TC-201-3",
            street: "teststreet",
            city: "testcity",
            emailAddress: "t.TC2013@UC201.nl",
            password: "invalid",
            phoneNumber: "06-12345678"
        }
        chai.request(server).post("/api/user").send(registerJson).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equal("Register-endpoint: Bad Request, \"invalid\" is not a valid password (at least 1 number and 1 capital, 8 minimum characters)");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-4-UserAlreadyExists', (done) => {
        //Testing for already existing user (email=j.doe@server.com)
        const registerJson = {
            firstName: "TC-201-4",
            lastName: "TC-201-4",
            street: "teststreet",
            city: "testcity",
            emailAddress: "j.doe@server.com",
            password: "Testpassword1!",
            phoneNumber: "06-12345678"
        }
        chai.request(server).post("/api/user").send(registerJson).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.equal("Register-endpoint: Forbidden, user with email: 'j.doe@server.com' already exists");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-201-5-SuccesfullRegistration', (done) => {
        //Testing for succesfull registration
        const registerJson = {
            firstName: "TC-201-5",
            lastName: "TC-201-5",
            street: "teststreet",
            city: "testcity",
            emailAddress: "t.TC2015@UC201.nl",
            password: "Testpassword1!",
            phoneNumber: "06-12345678"
        }
        chai.request(server).post("/api/user").send(registerJson).end(async (err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(201)
            message.should.be.a("string").that.equal("Register-endpoint: Created, succesfully created a new user");
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "password", "phoneNumber", "roles");
            data.id.should.be.a("number");
            data.firstName.should.be.a("string").that.equal("TC-201-5");
            data.lastName.should.be.a("string").that.equal("TC-201-5");
            data.street.should.be.a("string").that.equal("teststreet");
            data.city.should.be.a("string").that.equal("testcity");
            data.isActive.should.be.a("boolean").that.equals(true);
            data.emailAddress.should.be.a("string").that.equal("t.TC2015@UC201.nl");
            data.password.should.be.a("string").that.equal("Testpassword1!");
            data.phoneNumber.should.be.a("string").that.equal("06-12345678");
            data.roles.should.be.an("string").that.equal("editor,guest");
            await chai.request(server).delete(`/api/user/${data.id}`).set('Authorization', "Bearer " + jwt.sign({ userId: data.id }, process.env.jwtSecretKey)).then();
            done();
        })
    })
})