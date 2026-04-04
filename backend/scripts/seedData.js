// scripts/seedData.js
const mongoose = require('mongoose');
const Monastery = require('../models/Monastery');
const Attraction = require('../models/Attraction');
require('dotenv').config();

const monasteries = [
    {
        name: 'Rumtek Monastery',
        location: 'Rumtek, East Sikkim',
        coordinates: [27.3217, 88.6129],
        district: 'East Sikkim',
        tradition: 'Karma Kagyu',
        established: 1960,
        altitude: 1500,
        summary: 'Largest monastery in Sikkim and the important seat of the Karma Kagyu lineage.',
        description: 'Rumtek Monastery, also known as the Dharmachakra Centre, is one of the most important Tibetan Buddhist monasteries in India and the key Karma Kagyu center in Sikkim.',
        virtualTourUrl: '',
        images: [],
        festivals: [
            {
                name: 'Losar',
                date: 'February/March',
                description: 'Tibetan New Year with prayers, rituals, and monastery celebrations.'
            }
        ],
        visitingHours: '6:00 AM - 6:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Enchey Monastery',
        location: 'Gangtok, East Sikkim',
        coordinates: [27.3428, 88.6196],
        district: 'East Sikkim',
        tradition: 'Nyingmapa',
        established: 1840,
        altitude: 1900,
        summary: 'Historic Gangtok monastery known for its annual masked Chaam dance.',
        description: 'Enchey Monastery belongs to the Nyingma tradition and is one of Gangtok\'s most visited spiritual sites, especially during the colorful annual Chaam festival.',
        virtualTourUrl: '',
        images: [],
        festivals: [
            {
                name: 'Chaam Festival',
                date: 'December/January',
                description: 'Sacred masked dance performed by monks.'
            }
        ],
        visitingHours: '6:00 AM - 6:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Pemayangtse Monastery',
        location: 'Pelling, West Sikkim',
        coordinates: [27.3019, 88.2338],
        district: 'West Sikkim',
        tradition: 'Nyingmapa',
        established: 1705,
        altitude: 2085,
        summary: 'One of Sikkim\'s oldest monasteries overlooking the Kanchenjunga range.',
        description: 'Pemayangtse is among the premier monasteries of Sikkim and is known for its rich murals, woodwork, and important role in West Sikkim\'s religious history.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '7:00 AM - 5:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Tashiding Monastery',
        location: 'Tashiding, West Sikkim',
        coordinates: [27.3085, 88.2628],
        district: 'West Sikkim',
        tradition: 'Nyingmapa',
        established: 1641,
        altitude: 1465,
        summary: 'Sacred hilltop monastery revered for the annual Bumchu ceremony.',
        description: 'Tashiding Monastery stands between the Rathong and Rangeet rivers and is considered one of the holiest sites in Sikkim for Buddhist pilgrims.',
        virtualTourUrl: '',
        images: [],
        festivals: [
            {
                name: 'Bumchu',
                date: 'February/March',
                description: 'Annual sacred vase ritual attended by pilgrims from across the Himalayas.'
            }
        ],
        visitingHours: '6:00 AM - 6:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Dubdi Monastery',
        location: 'Yuksom, West Sikkim',
        coordinates: [27.3737, 88.2291],
        district: 'West Sikkim',
        tradition: 'Nyingmapa',
        established: 1701,
        altitude: 2100,
        summary: 'Oldest monastery in Sikkim, linked to the coronation of the first Chogyal.',
        description: 'Dubdi Monastery is a historically important Nyingma monastery near Yuksom and is associated with the early Buddhist kingdom of Sikkim.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:00 AM - 5:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Ralang Monastery',
        location: 'Ravangla, South Sikkim',
        coordinates: [27.3127, 88.3574],
        district: 'South Sikkim',
        tradition: 'Karma Kagyu',
        established: 1768,
        altitude: 2130,
        summary: 'Important Kagyu monastery near Ravangla known for Pang Lhabsol observances.',
        description: 'Ralang Monastery is one of the key monasteries of South Sikkim and is associated with major ritual performances and annual religious gatherings.',
        virtualTourUrl: '',
        images: [],
        festivals: [
            {
                name: 'Pang Lhabsol',
                date: 'August/September',
                description: 'Traditional festival honoring Mount Kanchenjunga and guardian deities.'
            }
        ],
        visitingHours: '6:00 AM - 5:30 PM',
        entryFee: 'Free'
    },
    {
        name: 'Phodong Monastery',
        location: 'Phodong, North Sikkim',
        coordinates: [27.4521, 88.5308],
        district: 'North Sikkim',
        tradition: 'Karma Kagyu',
        established: 1740,
        altitude: 1370,
        summary: 'Colorful monastery in North Sikkim with large annual cham performances.',
        description: 'Phodong Monastery is among the principal monasteries in North Sikkim and is known for its murals and annual mask dance celebrations.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:30 AM - 5:30 PM',
        entryFee: 'Free'
    },
    {
        name: 'Labrang Monastery',
        location: 'Labrang, North Sikkim',
        coordinates: [27.4718, 88.5322],
        district: 'North Sikkim',
        tradition: 'Nyingmapa',
        established: 1840,
        altitude: 1700,
        summary: 'Hilltop monastery in North Sikkim with broad valley and mountain views.',
        description: 'Labrang Monastery is a prominent Nyingma monastery in North Sikkim and remains an active religious center for nearby communities.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:00 AM - 5:30 PM',
        entryFee: 'Free'
    },
    {
        name: 'Sanga Choeling Monastery',
        location: 'Pelling, West Sikkim',
        coordinates: [27.2999, 88.2266],
        district: 'West Sikkim',
        tradition: 'Nyingmapa',
        established: 1697,
        altitude: 2150,
        summary: 'One of the oldest monasteries near Pelling, reached by a scenic ridge trail.',
        description: 'Sanga Choeling Monastery is a historic Nyingma center above Pelling and is known for its elevated location and traditional prayer halls.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '7:00 AM - 5:00 PM',
        entryFee: 'Free'
    },
    {
        name: 'Lingdum Monastery (Ranka)',
        location: 'Ranka, East Sikkim',
        coordinates: [27.3038, 88.6261],
        district: 'East Sikkim',
        tradition: 'Karma Kagyu',
        established: 1998,
        altitude: 1510,
        summary: 'Modern Kagyu monastery near Gangtok with a large teaching and prayer complex.',
        description: 'Lingdum Monastery, often called Ranka Monastery, is a significant contemporary Buddhist complex known for its architecture and spiritual training activities.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:00 AM - 5:30 PM',
        entryFee: 'Free'
    },
    {
        name: 'Kartok Monastery',
        location: 'Yuksom, West Sikkim',
        coordinates: [27.3711, 88.2243],
        district: 'West Sikkim',
        tradition: 'Nyingmapa',
        established: 1717,
        altitude: 1780,
        summary: 'Important monastery in Yuksom associated with Sikkim\'s early Buddhist kingdom.',
        description: 'Kartok Monastery is one of the significant monasteries of Yuksom and has deep historical links with the first Chogyal period in Sikkim.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:00 AM - 5:30 PM',
        entryFee: 'Free'
    },
    {
        name: 'Ngadak Monastery',
        location: 'Namchi, South Sikkim',
        coordinates: [27.1631, 88.3638],
        district: 'South Sikkim',
        tradition: 'Nyingmapa',
        established: 1710,
        altitude: 1675,
        summary: 'Historic monastery near Namchi known for old architecture and local reverence.',
        description: 'Ngadak Monastery is one of the older Buddhist sites of South Sikkim and remains culturally significant for residents and pilgrims in the Namchi region.',
        virtualTourUrl: '',
        images: [],
        visitingHours: '6:30 AM - 5:30 PM',
        entryFee: 'Free'
    }
];

const attractions = [
    {
        name: 'MG Marg',
        coordinates: [27.33, 88.62],
        description: 'Main pedestrian shopping street in Gangtok',
        type: 'Market'
    },
    {
        name: 'Buddha Park Ravangla',
        coordinates: [27.31, 88.37],
        description: 'Giant Buddha statue with landscaped gardens and monastery complex',
        type: 'Monument'
    },
    {
        name: 'Pelling Skywalk',
        coordinates: [27.30, 88.24],
        description: 'Glass skywalk with panoramic views near Chenrezig statue',
        type: 'Viewpoint'
    },
    {
        name: 'Tsomgo Lake',
        coordinates: [27.36, 88.75],
        description: 'Sacred glacial lake at 12,313 ft altitude',
        type: 'Lake'
    },
    {
        name: 'Nathula Pass',
        coordinates: [27.3865, 88.8307],
        description: 'Historic high-altitude mountain pass on the Indo-China border route',
        type: 'Viewpoint'
    },
    {
        name: 'Gurudongmar Lake',
        coordinates: [28.0206, 88.7107],
        description: 'One of the highest lakes in the world in North Sikkim',
        type: 'Lake'
    },
    {
        name: 'Yumthang Valley',
        coordinates: [27.8441, 88.7039],
        description: 'High-altitude valley famous for alpine meadows and seasonal blooms',
        type: 'Park'
    },
    {
        name: 'Khecheopalri Lake',
        coordinates: [27.3715, 88.2064],
        description: 'Sacred wish-fulfilling lake near Khecheopalri village',
        type: 'Lake'
    },
    {
        name: 'Rabdentse Ruins',
        coordinates: [27.3033, 88.2332],
        description: 'Archaeological remains of the second capital of the Kingdom of Sikkim',
        type: 'Monument'
    },
    {
        name: 'Namchi Char Dham',
        coordinates: [27.1724, 88.3664],
        description: 'Large pilgrimage and cultural complex with a giant Shiva statue',
        type: 'Monument'
    },
    {
        name: 'Hanuman Tok',
        coordinates: [27.3596, 88.6142],
        description: 'Hilltop temple viewpoint with broad views of Gangtok and surrounding peaks',
        type: 'Viewpoint'
    },
    {
        name: 'Tashi View Point',
        coordinates: [27.3567, 88.6179],
        description: 'Popular sunrise viewpoint for Kanchenjunga and Gangtok valley panoramas',
        type: 'Viewpoint'
    },
    {
        name: 'Kanchenjunga Falls',
        coordinates: [27.2808, 88.2231],
        description: 'Scenic mountain waterfall on the route between Pelling and Yuksom',
        type: 'Park'
    },
    {
        name: 'Temi Tea Garden',
        coordinates: [27.2391, 88.3744],
        description: 'Sikkim\'s famous tea estate with rolling hills and valley viewpoints',
        type: 'Park'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Monastery.deleteMany({});
        await Attraction.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert monasteries
        await Monastery.insertMany(monasteries);
        console.log(`✅ Inserted ${monasteries.length} monasteries`);

        // Insert attractions
        await Attraction.insertMany(attractions);
        console.log(`✅ Inserted ${attractions.length} attractions`);

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();