import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
// Import axios, a library for making HTTP requests
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; 
const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1/current.json';

if (!WEATHER_API_KEY) {
    console.error('ERROR: WeatherAPI key is missing. Please check your .env file.');
    process.exit(1);
}
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

app.get( "/", (req,res) =>{
    res.render("index.ejs");
});

app.get("/weather" , async (req , res) => {
    try {
        const q = req.query.q;

        if (!q) {
            return res.status(400).json({ error: 'Missing q parameter'});
        };
        
        const response = await axios.get(WEATHER_API_BASE_URL, {
            params: {
                key: WEATHER_API_KEY,
                q: q
            }
        });

        res.json({
            location: response.data.location,
            current: response.data.current
        });

    } catch(error) {
        console.error('Weather API error:', error);
        if (error.response) {
            res.status(error.response.status).json({ 
                error: error.response.data.message || 'Weather API request failed' 
            });
        } else if (error.request) {
            res.status(500).json({ error: 'No response received from Weather API' });
        } else {
            res.status(500).json({ error: 'Error setting up Weather API request' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on ${port}.`);
    });