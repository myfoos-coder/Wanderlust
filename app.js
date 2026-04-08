require("dotenv").config();

const express=require("express");
const app =express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const Listing=require("./models/listing.js");
const listingRoutes=require("./routes/listing.js");
const reviewRoutes=require("./routes/reviews.js");
const userRoutes=require("./routes/user.js");
const {isLoggedIn, saveRedirectUrl}=require("./middleware.js");

const session =require("express-session");
const MongoStore=require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const { db } = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { error } = require("console");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db")
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
    
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", (err)=>{
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions={
    store: store,
    secret: process.env.SECRET || "mysupersecretcode",
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        sameSite:"lax",
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};   


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(saveRedirectUrl);

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// app.get("/search", wrapAsync(async (req, res) => {
//   const query = req.query.q;
//   const results = await Listing.find({
//     $or: [
//       { title: { $regex: query, $options: "i" } },
//       { country: { $regex: query, $options: "i" } }
//     ]
//   });
// //   console.log(results);
//   res.render("listings/search.ejs", { results, query });
// }));  

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.use("/",userRoutes);
app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",reviewRoutes);


app.use((req,res,next)=>{
    next(new ExpressError("Page Not Found",404));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs",{message});
});

// app.get("/search", async (req, res) => {
//   const query = req.query.q;

//   const results = await Listing.find({
//     $or: [
//       { title: { $regex: query, $options: "i" } },
//       { country: { $regex: query, $options: "i" } }
//     ]
// });
//     res.render("listings/search.ejs", { results, query });
// }
// );
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
});


