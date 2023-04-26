const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('User Overview UC-202', function () {
    it('TC-202-1-ShowAllUsers', (done) => {
        //Testing for at least two users without filters
        chai.request(server).get("/api/user").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("All Users-endpoint");
            data.should.be.an("array").to.have.lengthOf.at.least(5);
            done();
        })
    })
    it('TC-202-2-ShowNoUsersOnNonExistingSearchFields', (done) => {
        //Testing for at least two users with filters that are not existent
        chai.request(server).get("/api/user?nonexistent=fake").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("Unknown column 'nonexistent' in 'where clause'");
            data.should.be.an("array").to.have.length(0);
            done();
        })
    })
    it('TC-202-3-ShowUsersIsActiveFalse', (done) => {
        //Testing for users that are not active with filter isActive=false
        chai.request(server).get("/api/user?isActive=false").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("All Users-endpoint");
            data.should.be.an("array");
            data.forEach(user => {
                let { isActive } = user;
                isActive.should.to.be.equal(0);
            })
            done();
        })
    })
    it('TC-202-4-ShowUsersIsActiveTrue', (done) => {
        //Testing for users that are active with filter isActive=true
        chai.request(server).get("/api/user?isActive=true").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("All Users-endpoint");
            data.should.be.an("array");
            data.forEach(user => {
                let { isActive } = user;
                isActive.should.to.be.equal(1);
            })
            done();
        })
    })
    it('TC-202-5-ShowUsersOnMultipleFilters', (done) => {
        //Testing for users that are active and life in "Breda" with filter isActive=true&city=Breda
        chai.request(server).get("/api/user?isActive=true&city=Breda").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.contains("All Users-endpoint");
            data.should.be.an("array");
            data.forEach(user => {
                let { isActive, city } = user;
                isActive.should.to.be.equal(1);
                city.should.to.be.equal("Breda");
            })
            done();
        })
    })
})