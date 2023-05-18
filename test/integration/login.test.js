const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('UC-101 Login', function () {
    it('TC-101-1-RequiredFieldMissing', (done) => {
        //Testing for loggin in with an missing field
        const login = {
            // emailAddress: "t.TC1011@UC101.nl",
            password: "test"
        }
        chai.request(server).post("/api/login").send(login).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equals(`Login-endpoint: Bad Request, \"emailAddress\" is required`);
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-101-2-InvalidPassword', (done) => {
        //Testing for loggin in with an invalid password
        const login = {
            emailAddress: "t.TC1012@UC101.nl",
            password: "invalid"
        }
        chai.request(server).post("/api/login").send(login).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(400)
            message.should.be.a("string").that.equals(`Login-endpoint: Bad Request, \"${login.password}\" is not a valid password (at least 1 number and 1 capital, 8 minimum characters)`);
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-101-3-UserDoesNotExist', (done) => {
        //Testing for loggin in with an account that does not exist
        const login = {
            emailAddress: "t.TC1013@UC101.nl",
            password: "Valid123"
        }
        chai.request(server).post("/api/login").send(login).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equals(`Login-endpoint: Not Found, user with email: '${login.emailAddress}' does not exist`);
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-101-4-UserSuccesfullyLoggedIn', (done) => {
        //Testing for succesfull login
        const login = {
            emailAddress: "m.vandullemen@server.nl",
            password: "Secret123"
        }
        chai.request(server).post("/api/login").send(login).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equals(`Login-endpoint: OK, welcome Mariëtte van den Dullemen`);
            data.should.be.an("object");
            data.should.have.keys("id", "firstName", "lastName", "isActive", "emailAddress", "phoneNumber", "roles", "street", "city", "token");
            data.id.should.be.a("number").that.equals(1);
            data.firstName.should.be.a("string").that.equals("Mariëtte");
            data.lastName.should.be.a("string").that.equals("van den Dullemen");
            data.isActive.should.be.a("boolean").that.equals(true);
            data.emailAddress.should.be.a("string").that.equals("m.vandullemen@server.nl");
            data.phoneNumber.should.be.a("string").that.equals("06-12345678");
            data.street.should.be.a("string");
            data.city.should.be.a("string");
            data.token.should.be.a("string");
            done();
        })
    })
})