const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);

describe('Server-Info', function () {
    it('TC-102-ServerInfo', (done) => {
        chai.request(server).get("/api/info").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.has.property("status").to.be.equal(200);
            res.body.should.has.property("message");
            res.body.should.has.property("data");
            done();
        })
    })
})