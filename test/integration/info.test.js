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
            let{data, message} = res.body;
            data.should.be.an("object");
            data.should.has.property("studentName").to.be.equal("Melchior Willenborg");
            data.should.has.property("studentNumber").to.be.equal(2205378);
            data.should.has.property("description");
            done();
        })
    })
})