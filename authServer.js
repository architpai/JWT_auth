require("dotenv").config()
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const app = express()

app.use(express.json())

const port = process.env.TOKEN_SERVER_PORT

const users = []
// REGISTER A USER
app.post("/createUser", async (req, res) => {
    const user = req.body.name
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({ user: user, password: hashedPassword })
    res.status(201).send(users)
    console.log(users)
})

//AUTHENTICATE LOGIN AND RETURN JWT TOKEN
app.post("/login", async (req, res) => {
    const user = users.find((c) => c.user == req.body.name)
    //check to see if the user exists in the list of registered users
    if (user == null) res.status(404).send("User does not exist!")
    //if user does not exist, send a 400 response
    if (await bcrypt.compare(req.body.password, user.password)) {
        const accessToken = generateAccessToken({ user: req.body.name })
        const refreshToken = generateRefreshToken({ user: req.body.name })
        res.json({ accessToken: accessToken, refreshToken: refreshToken })
    }
    else {
        res.status(401).send("Password Incorrect!")
    }
})

//REFRESH TOKEN API
app.post("/refreshToken", (req, res) => {
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken({ user: req.body.name })
    const refreshToken = generateRefreshToken({ user: req.body.name })
    //generate new accessToken and refreshTokens
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

//LOGOUT USER
app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    res.status(204).send("Logged out!")
})

app.listen(port, () => {
    console.log(`Authorization Server running on ${port}...`)
})

//Helpers
// accessTokens
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}
// refreshTokens
let refreshTokens = []
function generateRefreshToken(user) {
    const refreshToken =
        jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
    refreshTokens.push(refreshToken)
    return refreshToken
}