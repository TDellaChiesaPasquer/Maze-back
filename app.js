require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
var logger = require('morgan');
require('./models/connection');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const mazeRouter = require('./routes/maze');

var app = express();
app.use(cookieParser());
const cors = require('cors');
app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/maze', mazeRouter);

module.exports = app;
