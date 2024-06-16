import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDb } from './DB/connection.js'
import userRouter from './src/Modules/user/user.routes.js'
import carRouter from './src/Modules/car/car.routes.js'
import rentalRouter from './src/Modules/rental/rental.routes.js'

const PORT = process.env.PORT || 5000;

// Load environment variables from config.env
dotenv.config({ path: 'config.env' });

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => { res.send('Car Rental System API Work') });

// Router MW
app.use('/users', userRouter)
app.use('/cars', carRouter)
app.use('/rentals', rentalRouter)

// not found router
app.use('*', (req, res, next) => {
    const err = new Error(`can't find this route: ${req.originalUrl}`)
    next(err.message)
});

app.listen(PORT, async (err) => {
    if (err) {
        return console.error('Failed to start the server:', err);
    };
    // Database conncation
    if (await connectDb()) {
        console.log(`DataBase Connected successfully..App running on port ${PORT}`);
    } else {
        console.error('MongoDB connection failed, shutting down the server');
        process.exit(1);
    };
});