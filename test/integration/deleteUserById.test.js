const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('Delete User By Id UC-206', function () {
    it('TC-206-1-UserDoesNotExist', (done) => {
        //Testing for deleting user that does not exist
        chai.request(server).delete("/api/user/999?token=validtoken").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.contains("Userdata Delete-endpoint: Not Found, User with ID #999 not found");
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
        chai.request(server).post("/api/register?firstName=testfirst&lastName=testlast&street=teststreet&city=testcity&emailAdress=test@test.nl&password=test1!&phoneNumber=31636363655").end((err, res) => {
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