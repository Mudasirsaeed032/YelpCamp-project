const mongoose = require('mongoose');
const CampGround = require('../models/campGround');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(() => {
        console.log("Mongo Connection Open");
    })
    .catch(error => {
        console.log("There has been an error Sire!");
        console.log(error);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await CampGround.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const camp = new CampGround(
            {
                title: `${sample(descriptors)} ${sample(places)}`,
                location: `${cities[rand].city}, ${cities[rand].state}`,
                image: [
                    {
                        url: `https://picsum.photos/200?random=${Math.random()}`,
                        path: 'YelpCamp/mmv5cax72jfc6qrdqbdl'
                    }
                ],
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
                geometry: {
                    type: 'Point',
                    coordinates: [
                        cities[rand].longitude,
                        cities[rand].latitude
                    ]
                },
                price: Math.floor(Math.random() * 20) + 10,
                author: '66a8eb743734822a15aa1d8a'
            }
        )
        await camp.save();
    }
}

seedDB();