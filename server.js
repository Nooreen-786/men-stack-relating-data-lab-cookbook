const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');

const authController = require('./men-stack-session-auth-template/controllers/auth.js');
const foodsController = require('./men-stack-session-auth-template/controllers/foods.js');
const communityUsersController = require('./men-stack-session-auth-template/controllers/communityUsers.js');
const recipesController = require('./men-stack-session-auth-template/controllers/recipes.js');
const ingredientsController = require('./men-stack-session-auth-template/controllers/ingredient.js');

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB: ${mongoose.connection.name}`))
  .catch(err => console.error(`MongoDB connection error: ${err}`));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'men-stack-session-auth-template', 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true,
}));


app.use(passUserToView);


app.use('/auth', authController);


app.get('/', (req, res) => {
  res.render('index', {
    user: req.session.user || null,
  });
});

app.get('/vip-lounge', isSignedIn, (req, res) => {
  res.send(`Welcome to the party, ${req.session.user.username}.`);
});

app.use('/users/communityUsers', isSignedIn, communityUsersController);
app.use('/', isSignedIn, foodsController);
app.use('/', isSignedIn, recipesController);
app.use('/', isSignedIn, ingredientsController);

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
