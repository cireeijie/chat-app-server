const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import routes
const authRoute = require('./routes/auth');
const message = require('./routes/message');
const search = require('./routes/search');
const conversation = require('./routes/conversation');
const onlineUsers = require('./routes/onlineUsers');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_CONNECT)
.then(() => {
    console.log('Connected to DB');
})
.catch(() => {
    console.log('Failed to connect to DB');
});

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/message', message);
app.use('/api/search', search);
app.use('/api/conversation', conversation);
app.use('/api/users/online', onlineUsers);

app.listen(3000, () => {
    console.log('Running on Port 3000');
});