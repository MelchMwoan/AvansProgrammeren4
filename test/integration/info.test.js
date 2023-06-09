const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const dbconnection = require('../../src/utils/mysql-db.js');

describe('Server-Info', function () {
    it('TC-102-1-ServerInfo', (done) => {
        chai.request(server).get("/api/info").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("Server Info-endpoint");
            data.should.be.an("object");
            data.should.has.property("studentName").to.be.equal("Melchior Willenborg");
            data.should.has.property("studentNumber").to.be.equal(2205378);
            data.should.has.property("description").to.be.equal("Dit is de ShareAMeal API voor programmeren 4");
            done();
        })
    })
    it('TC-102-2-InvalidEndpoint', (done) => {
        chai.request(server).get("/api/unknown").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Endpoint not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
})