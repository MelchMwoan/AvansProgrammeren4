const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const jdw = require('jsonwebtoken');

describe('Get All Meals UC-303', function () {
    it('TC-303-1-GetAllMeals', (done) => {
        //Testing for getting all meals
        chai.request(server).get("/api/meal").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("All Meals-endpoint");
            data.should.be.an("array");
            data.should.not.be.empty;
            expect(data).to.have.lengthOf.at.least(3);
            expect(data.every(obj => {
                expect(obj).to.have.all.keys("id", "name", "description", "price", "isActive", "updateDate", "participants", "maxAmountOfParticipants", "isVega", "isVegan", "isToTakeHome", "imageUrl", "dateTime", "createDate", "cook", "allergenes");
                obj.id.should.be.a("number");
                obj.name.should.be.a("string");
                obj.description.should.be.a("string");
                obj.price.should.be.a("number");
                obj.isActive.should.be.a("boolean");
                obj.updateDate.should.be.a("string");
                obj.participants.should.be.a("array");
                obj.maxAmountOfParticipants.should.be.a("number");
                obj.isVega.should.be.a("boolean");
                obj.isVegan.should.be.a("boolean");
                obj.isToTakeHome.should.be.a("boolean");
                obj.imageUrl.should.be.a("string");
                obj.dateTime.should.be.a("string");
                obj.createDate.should.be.a("string");
                obj.cook.should.be.a("object");
                obj.cook.should.have.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
                obj.cook.id.should.be.a("number");
                obj.cook.firstName.should.be.a("string");
                obj.cook.lastName.should.be.a("string");
                obj.cook.emailAddress.should.be.a("string");
                obj.cook.phoneNumber.should.be.a("string");
                obj.cook.street.should.be.a("string");
                obj.cook.city.should.be.a("string");
                obj.cook.isActive.should.be.a("boolean");
                obj.cook.roles.should.be.an("string");
                obj.allergenes.should.be.a("string");
                if(obj.participants.length > 0) {
                    expect(obj.participants.every(obj => {
                        expect(obj).to.have.all.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
                        obj.id.should.be.a("number");
                        obj.firstName.should.be.a("string");
                        obj.lastName.should.be.a("string");
                        obj.emailAddress.should.be.a("string");
                        obj.phoneNumber.should.be.a("string");
                        obj.street.should.be.a("string");
                        obj.city.should.be.a("string");
                        obj.isActive.should.be.a("boolean");
                        return obj.roles.should.be.an("string");
                    })).to.be.true;
                }
                return true;
            })).to.be.true;
            done();
        })
    })
})