require("dotenv").config()
const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")

app.use(express.json())

const port = process.env.PORT

app.get("/posts", validateToken, (req, res) => {
    console.log("Token is valid")
    console.log(req.user.user)
    res.send(`${req.user.user} successfully accessed post`)
})

app.listen(port, () => {
    console.log(`Validation server running on ${port}...`)
})
//Helper
//validation middleware?
function validateToken(req, res, next) {
    //get token from request header
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    //Bearer <token>", split the string and use the second value 
    if (token == null) res.sendStatus(400).send("Token not present")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(403).send("Token invalid")
        }
        else {
            req.user = user
            next() //proceed to the next action in the calling function
        }
    })
}