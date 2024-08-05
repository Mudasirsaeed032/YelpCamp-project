if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Joi = require('joi');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);

const CampGround = require('./models/campGround')
const Review = require('./models/review.js');
const User = require('./models/user.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users.js')
const dbUrl = 'mongodb://localhost:27017/YelpCamp';


// console.log(process.env.CLOUDINARY_NAME);
// console.log(process.env.CLOUDINARY_SECRET);
// console.log(process.env.CLOUDINARY_KEY);
mongoose.connect(dbUrl)

    .then(() => {
        console.log("Mongo Connection Open");
    })
    .catch(error => {
        console.log("There has been an error Sire!");
        console.log(error);
    })


app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(flash());
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

const store = new MongoStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log('Session Store Error', e);
});

const sessionConfig = {
    store,
    name: 'cooookie',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const protectedRoute = (req, res, next) => {
    const { password } = req.query;
    if (password === 'noFap') {
        next();
    }
    res.send('You shall not pass!');
}

app.get('/protected', protectedRoute, (req, res) => {
    res.send('Welcome to the protected route!');
});

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'mudasaki@gmail.com', username: 'mudasaki' });
    const newUser = await User.register(user, 'manchie');
    res.send(newUser);
})

app.use('/', usersRoutes)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use('/campgrounds', (req, res, next) => {
    next();
})


app.get('/', (req, res) => {
    res.render('home.ejs');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

//This is an error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('errors', { err });
})

app.listen(3000, () => {
    console.log('YelpCamp Server has started!');
})