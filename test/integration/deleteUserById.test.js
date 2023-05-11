const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const dbconnection = require('../../src/utils/mysql-db.js');

describe('Delete User By Id UC-206', function () {
    it('TC-206-1-UserDoesNotExist', (done) => {
        //Testing for deleting user that does not exist
        chai.request(server).delete("/api/user/9999?token=validtoken").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.contains("Userdata Delete-endpoint: Not Found, User with ID #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-206-2-NotLoggedIn', (done) => {
        //Testing for deleting user without being logged in
        //TODO: test for logged in
        chai.request(server).delete("/api/user/xxxx?token=validtoken").end((err, res) => {
            done();
        })
    })
    it('TC-206-3-DeleterIsNotOwnerOfData', (done) => {
        //Testing for deleting user details with Id without being owner
        //TODO: Testing for ownership through token
        chai.request(server).delete("/api/user/xxxx?token=validtoken").end((err, res) => {
            done();
        })
    })
    it('TC-206-4-UserSuccesfullyDeleted', (done) => {
        //Testing for deleting user
        chai.request(server).post("/api/register?firstName=TC-206-4&lastName=TC-206-4&street=teststreet&city=testcity&emailAdress=t.TC2064@UC206.nl&password=Testpassword1!&phoneNumber=06 12345678").end((err, res) => {
            const id = res.body.data.id;
            chai.request(server).delete(`/api/user/${id}?token=validtoken`).end((err, res) => {
                res.body.should.be.an("object");
                res.body.should.have.keys("status", "message", "data");
                let { data, message, status } = res.body;
                status.should.equal(200)
                message.should.be.a("string").that.contains(`Userdata Delete-endpoint: User with ID #${id} succesfully deleted`);
                data.should.be.an("object");
                data.should.be.empty;
                done();
            })
        })
    })
})