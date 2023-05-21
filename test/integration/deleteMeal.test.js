const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
chai.should();
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Delete Meal UC-305', function () {
    it('TC-305-1-NotLoggedIn', (done) => {
        //Testing for deleting meal without being logged in
        chai.request(server).delete("/api/meal/1").end((err, res) => {
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
    it('TC-305-2-NotOwnerOfMeal', (done) => {
        //Testing for deleting meal without being the owner of the meal
        chai.request(server).delete("/api/meal/2").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(403)
            message.should.be.a("string").that.equal("Mealdata Delete-endpoint: Forbidden, you are not the cook of the meal with id #2");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-305-3-MealDoesNotExist', (done) => {
        //Testing for deleting meal that does not exist
        chai.request(server).delete("/api/meal/9999").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.have.keys("status", "message", "data");
            let { data, message, status } = res.body;
            status.should.equal(404)
            message.should.be.a("string").that.equal("Mealdata Delete-endpoint: Not Found, Meal with ID #9999 not found");
            data.should.be.an("object");
            data.should.be.empty;
            done();
        })
    })
    it('TC-305-4-DeleteMeal', (done) => {
        //Testing for deleting meal
        let meal = {
            name: "Pasta",
            description: "Pasta with tomato sauce",
            price: 5.50,
            maxAmountOfParticipants: 5,
            dateTime: "2021-05-05T18:00:00.000Z",
            imageUrl: "https://images.food52.com/8kJ4moklcq55uy3Qw2LTnxqCQP8=/1200x1200/c0c6aec8-e771-4c84-88fb-3aba6448d553--Pasta.jpg"
        }
        chai.request(server).post("/api/meal").set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).send(meal).end((err, res) => {
            let mealId = res.body.data.id;
            chai.request(server).delete("/api/meal/" + mealId).set('Authorization', 'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWTSECRETKEY)).end((err, res) => {
                res.body.should.be.an("object");
                res.body.should.have.keys("status", "message", "data");
                let { data, message, status } = res.body;
                status.should.equal(200)
                message.should.be.a("string").that.equal(`Maaltijd met ID ${mealId} is verwijderd`);
                data.should.be.an("object");
                data.should.be.empty;
                done();
            })
        })
    })
})