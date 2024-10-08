import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import userrouter from "./routes/user.routes.js";
import videorouter from "./routes/video.router.js";
import tweetrouter from "./routes/tweet.router.js";
import subscriberroute from "./routes/subscriber.routes.js"
import Playlistrouter from "./routes/playlist.router.js"
import likerouter from "./routes/likes.router.js"
import dashboardrouter from "./routes/dasborad.router.js"
import commentrouter from "./routes/comment.router.js"
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({
    limit : "16kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

app.use(express.static("public"));
app.use(cookieParser());



// routes


app.use("/api/v1/users", userrouter)
app.use("/api/v1/videos",videorouter)
app.use("/api/v1/tweet", tweetrouter)
app.use("/api/v1/subscriptions", subscriberroute)
app.use("/api/v1/playlist", Playlistrouter)
app.use("/api/v1/likes", likerouter)
app.use("/api/v1/dashboard", dashboardrouter)
app.use("/api/v1/comments", commentrouter)



export {app}