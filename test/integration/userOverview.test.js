const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');
const expectedKeys = ["id", "firstName", "lastName", "street", "city", "isActive", "emailAddress", "phoneNumber", "roles"];

describe('User Overview UC-202', function () {
    it('TC-202-1-ShowAllUsers', (done) => {
        //Testing for at least two users without filters
        chai.request(server).get("/api/user").set('Authorization', "Bearer " + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("All Users-endpoint");
            data.should.be.an("array").to.have.lengthOf.at.least(2);
            expect(data.every(obj => {
                expect(obj).to.have.all.keys(expectedKeys);
                obj.id.should.be.a("number");
                obj.firstName.should.be.a("string");
                obj.lastName.should.be.a("string");
                obj.street.should.be.a("string");
                obj.city.should.be.a("string");
                obj.isActive.should.be.a("boolean");
                obj.emailAddress.should.be.a("string");
                obj.phoneNumber.should.be.a("string");
                return obj.roles.should.be.an("string");
            })).to.be.true;
            done();
        })
    })
    it('TC-202-2-ShowNoUsersOnNonExistingSearchFields', (done) => {
        //Testing for users that do not exist with filter nonexistent=fake
        chai.request(server).get("/api/user?nonexistent=fake").set('Authorization', "Bearer " + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("Unknown column 'nonexistent' in 'where clause'");
            data.should.be.an("array");
            data.should.be.empty;
            done();
        })
    })
    it('TC-202-3-ShowUsersIsActiveFalse', (done) => {
        //Testing for users that are inactive with filter isActive=false
        chai.request(server).get("/api/user?isActive=false").set('Authorization', "Bearer " + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("All Users-endpoint");
            data.should.be.an("array");
            data.should.not.be.empty;
            expect(data.every(obj => {
                expect(obj).to.have.all.keys(expectedKeys);
                obj.id.should.be.a("number");
                obj.firstName.should.be.a("string");
                obj.lastName.should.be.a("string");
                obj.street.should.be.a("string");
                obj.city.should.be.a("string");
                obj.isActive.should.be.a("boolean").that.equals(false);
                obj.emailAddress.should.be.a("string");
                obj.phoneNumber.should.be.a("string");
                return obj.roles.should.be.an("string");
            })).to.be.true;
            done();
        })
    })
    it('TC-202-4-ShowUsersIsActiveTrue', (done) => {
        //Testing for users that are active with filter isActive=true
        chai.request(server).get("/api/user?isActive=true").set('Authorization', "Bearer " + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("All Users-endpoint");
            data.should.be.an("array");
            data.should.not.be.empty;
            expect(data.every(obj => {
                expect(obj).to.have.all.keys(expectedKeys);
                obj.id.should.be.a("number");
                obj.firstName.should.be.a("string");
                obj.lastName.should.be.a("string");
                obj.street.should.be.a("string");
                obj.city.should.be.a("string");
                obj.isActive.should.be.a("boolean").that.equals(true);
                obj.emailAddress.should.be.a("string");
                obj.phoneNumber.should.be.a("string");
                return obj.roles.should.be.an("string");
            })).to.be.true;
            done();
        })
    })
    it('TC-202-5-ShowUsersOnMultipleFilters', (done) => {
        //Testing for users that are active and life in "Breda" with filter isActive=true&city=Breda
        chai.request(server).get("/api/user?isActive=true&city=Breda").set('Authorization', "Bearer " + jwt.sign({ userId: 1 }, process.env.jwtSecretKey)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("All Users-endpoint");
            data.should.be.an("array");
            data.should.not.be.empty;
            expect(data.every(obj => {
                expect(obj).to.have.all.keys(expectedKeys);
                obj.id.should.be.a("number");
                obj.firstName.should.be.a("string");
                obj.lastName.should.be.a("string");
                obj.street.should.be.a("string");
                obj.city.should.be.a("string").that.equals("Breda");
                obj.isActive.should.be.a("boolean").that.equals(true);
                obj.emailAddress.should.be.a("string");
                obj.phoneNumber.should.be.a("string");
                return obj.roles.should.be.an("string");
            })).to.be.true;
            done();
        })
    })
})