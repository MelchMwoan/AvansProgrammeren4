const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Apply to Meal UC-401', function () {
    it('TC-401-1-NotLoggedIn', (done) => {
        //Testing for applying to meal without being logged in
        chai.request(server).post("/api/meal/1/participate").end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(401)
            message.should.be.a("string").that.equal("Authentication-endpoint: Not Authorized, \"authorization\" is required");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-401-2-MealDoesNotExist', (done) => {
        //Testing for applying to meal that does not exist
        chai.request(server).post("/api/meal/9999/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Meal Participate-endpoint: Not Found, Meal with id #9999 does not exist");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-401-3-SuccesfullyApplied', (done) => {
        //Testing for succesfully applying to meal
        chai.request(server).post("/api/meal/1/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(200)
            message.should.be.a("string").that.equal("User met ID #1 is aangemeld voor maaltijd met ID #1");
            data.should.be.an("object");
            data.should.have.keys("user", "meal");
            let { user, meal } = data;
            user.should.be.an("object");
            user.should.have.keys("id", "firstName", "lastName", "emailAddress", "phoneNumber", "street", "city", "isActive", "roles");
            meal.should.be.an("object");
            meal.should.have.keys("id", "name", "description", "price", "isActive", "updateDate", "participants", "maxAmountOfParticipants", "isVega", "isVegan", "isToTakeHome", "imageUrl", "dateTime", "createDate", "cook", "allergenes");
            meal.participants.should.be.an("array")
            chai.expect(meal.participants).to.deep.include(user);
            chai.request(server).delete("/api/meal/1/participate").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).then();
            done();
        })
    })
    it('TC-401-4-MealIsFull', (done) => {
        //Testing for applying to meal that is full
        const registerJson = {
            firstName: "TC-401-4",
            lastName: "TC-401-4",
            street: "teststreet",
            city: "testcity",
            emailAddress: "t.TC4014@UC401.nl",
            password: "Testpassword1!",
            phoneNumber: "06-12345678"
        }
        let meal = {
            name: "TC-401-4",
            description: "TC-401-4",
            price: 1,
            maxAmountOfParticipants: 1,
            dateTime: new Date().getTime(),
            imageUrl: "https://images.food52.com/8kJ4moklcq55uy3Qw2LTnxqCQP8=/1200x1200/c0c6aec8-e771-4c84-88fb-3aba6448d553--Pasta.jpg"
        }
        chai.request(server).post("/api/meal").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).send(meal).end((err, res) => {
            let mealId = res.body.data.id;
            chai.request(server).post("/api/user").send(registerJson).end((err, res) => {
                let newUserId = res.body.data.id;
                chai.request(server).post(`/api/meal/${mealId}/participate`).set('Authorization', 'Bearer ' + jwt.sign({ userId: newUserId }, process.env.JWTSECRETKEY)).end((err, res) => {
                    chai.request(server).post(`/api/meal/${mealId}/participate`).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
                        res.body.should.be.an("object");
                        res.body.should.have.keys("status", "message", "data");
                        let { data, message, status } = res.body;
                        status.should.equal(200)
                        message.should.be.a("string").that.equal(`Meal Participate-endpoint: Meal with Id #${mealId} is already full`);
                        data.should.be.an("object");
                        data.should.be.empty;
                        chai.request(server).delete("/api/meal/" + mealId).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
                            chai.request(server).delete("/api/user/" + newUserId).set('Authorization', 'Bearer ' + jwt.sign({ userId: newUserId }, process.env.JWTSECRETKEY)).end((err, res) => {
                                done();
                            })
                        });
                    })
                });
            })
        })
    })
})
