const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Event Schema
const eventSchema = new mongoose.Schema({
    eventName: String,
    eventNameTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    description: String,
    descriptionTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    culturalSignificance: String,
    eventType: String,
    eventCategory: String,
    monasteryId: String,
    monasteryName: String,
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String,
    isRecurring: Boolean,
    recurrencePattern: String,
    venueLocation: String,
    venueDetails: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    region: String,
    touristAccess: String,
    accessRestrictions: String,
    bookingRequired: String,
    bookingUrl: String,
    contactEmail: String,
    contactPhone: String,
    dressCode: String,
    guidelines: [String],
    maxAttendees: Number,
    entryFee: String,
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    videoUrl: String,
    tags: [String],
    status: String,
    featured: Boolean
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

// Real Annual Events Data
const annualEvents = [
    // LOSAR - Tibetan New Year (February/March - varies by lunar calendar)
    {
        eventName: "Losar - Tibetan New Year",
        eventNameTranslations: {
            hindi: "लोसार - तिब्बती नववर्ष",
            tibetan: "ལོ་གསར།",
            nepali: "लोसार - तिब्बती नयाँ वर्ष"
        },
        description: "Losar is the most important festival in Tibetan Buddhism, marking the Tibetan New Year. Celebrated over three days with elaborate rituals, Cham dances performed by monks in colorful costumes and masks, traditional music, prayer ceremonies, and festive gatherings. The monastery is decorated with prayer flags and butter sculptures.",
        culturalSignificance: "Losar celebrates the victory of good over evil and marks the beginning of the new year according to the Tibetan lunar calendar. It's a time for purification, making offerings, and receiving blessings for the coming year.",
        eventType: "Festival",
        eventCategory: "Religious",
        monasteryId: "rumtek001",
        monasteryName: "Rumtek Monastery",
        startDate: new Date('2026-02-19'),
        endDate: new Date('2026-02-21'),
        startTime: "06:00",
        endTime: "18:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Main Prayer Hall and Courtyard, Rumtek Monastery",
        venueDetails: "Celebrations span the entire monastery complex including the main temple, courtyard, and surrounding areas",
        coordinates: {
            latitude: 27.3017,
            longitude: 88.5700
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        accessRestrictions: "No photography inside main prayer hall during ceremonies. Maintain silence during rituals.",
        bookingRequired: "No",
        contactEmail: "info@rumtekmonastery.org",
        contactPhone: "+91-3592-252211",
        dressCode: "Traditional or modest clothing. Remove shoes before entering prayer halls.",
        guidelines: [
            "Arrive early to witness the morning rituals",
            "Photography allowed in courtyard only",
            "Participate respectfully in public ceremonies",
            "Do not touch religious artifacts or altar items",
            "Clockwise circumambulation around stupas",
            "Donations appreciated but not mandatory"
        ],
        maxAttendees: 5000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
            caption: "Losar celebrations at Rumtek Monastery with Cham dancers",
            isPrimary: true
        }],
        tags: ["Losar", "Tibetan New Year", "Festival", "Cham Dance", "Cultural"],
        status: "Upcoming",
        featured: true
    },

    // SAGA DAWA - Birth, Enlightenment & Parinirvana of Buddha (May/June)
    {
        eventName: "Saga Dawa - Triple Blessed Festival",
        eventNameTranslations: {
            hindi: "सागा दावा - बुद्ध पूर्णिमा",
            tibetan: "ས་ག་ཟླ་བ།",
            nepali: "सागा दावा महोत्सव"
        },
        description: "Saga Dawa is the holiest month in Tibetan Buddhism, commemorating Buddha's birth, enlightenment, and parinirvana (passing into nirvana). The festival culminates on the full moon day with grand processions, butter lamp offerings, circumambulation of sacred sites, and merit-making activities. Thousands of pilgrims gather for this auspicious occasion.",
        culturalSignificance: "During Saga Dawa, the karmic effects of virtuous and non-virtuous actions are believed to be multiplied many times. Buddhists engage in prayer, meditation, acts of generosity, and releasing animals to accumulate merit.",
        eventType: "Festival",
        eventCategory: "Religious",
        monasteryId: "rumtek001",
        monasteryName: "Rumtek Monastery",
        startDate: new Date('2026-05-31'),
        endDate: new Date('2026-05-31'),
        startTime: "04:00",
        endTime: "21:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Rumtek Monastery Complex and Stupa",
        coordinates: {
            latitude: 27.3017,
            longitude: 88.5700
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "White or light-colored traditional clothing preferred",
        guidelines: [
            "Participate in the early morning circumambulation",
            "Vegetarian diet recommended during the festival",
            "Join in butter lamp offerings at dusk",
            "Refrain from alcohol and non-vegetarian food",
            "Carry water and comfortable walking shoes"
        ],
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1604608672516-9f3a791ff87e?w=800",
            caption: "Saga Dawa procession and butter lamp ceremony",
            isPrimary: true
        }],
        tags: ["Saga Dawa", "Buddha Purnima", "Pilgrimage", "Holy Month"],
        status: "Upcoming",
        featured: true
    },

    // DRUKPA TSECHI - at Pemayangtse Monastery
    {
        eventName: "Drukpa Tsechi Festival",
        eventNameTranslations: {
            hindi: "द्रुक्पा त्सेची उत्सव",
            tibetan: "འབྲུག་པ་ཚེས་བཅུ།"
        },
        description: "Drukpa Tsechi celebrates the first sermon given by Lord Buddha at Sarnath. The festival features sacred Cham dances depicting the victory of Buddhism over evil forces, traditional mask dances, and religious ceremonies performed by senior monks.",
        culturalSignificance: "This festival commemorates when Buddha set the Wheel of Dharma in motion, teaching the Four Noble Truths and the Eightfold Path to his first five disciples.",
        eventType: "Festival",
        eventCategory: "Religious",
        monasteryId: "pemayangtse001",
        monasteryName: "Pemayangtse Monastery",
        startDate: new Date('2026-07-25'),
        endDate: new Date('2026-07-26'),
        startTime: "08:00",
        endTime: "17:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Pemayangtse Monastery Courtyard",
        coordinates: {
            latitude: 27.3207,
            longitude: 88.2625
        },
        region: "West Sikkim",
        touristAccess: "Yes",
        bookingRequired: "Recommended",
        contactPhone: "+91-3595-250642",
        dressCode: "Comfortable traditional or modest clothing",
        guidelines: [
            "Best viewing spots fill up early - arrive by 7:30 AM",
            "Bring sun protection and water",
            "Photography allowed from designated areas",
            "Respect the sacred nature of mask dances"
        ],
        maxAttendees: 2000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
            caption: "Cham dance performance at Pemayangtse",
            isPrimary: true
        }],
        tags: ["Drukpa Tsechi", "Cham Dance", "Pemayangtse", "Festival"],
        status: "Upcoming",
        featured: true
    },

    // PHANG LHABSOL - Unique to Sikkim
    {
        eventName: "Phang Lhabsol - Guardian Deity Festival",
        eventNameTranslations: {
            hindi: "फांग ल्हाब्सोल - संरक्षक देवता महोत्सव",
            tibetan: "ཕང་ལྷ་གསོལ།",
            nepali: "फांग ल्हाब्सोल पर्व"
        },
        description: "Phang Lhabsol is a unique festival exclusive to Sikkim, celebrating Mount Kanchenjunga as the guardian deity of the land. The festival features the spectacular Warrior Dance (Pahang) with monks dressed in traditional warrior attire, depicting the consecration of Mount Kanchenjunga by Lhatsun Namkha Jigme.",
        culturalSignificance: "This festival celebrates the treaty of brotherhood between Lepchas and Bhutias, blessed by Kanchenjunga, the guardian deity. It symbolizes the unity and harmony of Sikkim's diverse communities.",
        eventType: "Festival",
        eventCategory: "Cultural",
        monasteryId: "rumtek001",
        monasteryName: "Rumtek Monastery",
        startDate: new Date('2026-09-15'),
        endDate: new Date('2026-09-15'),
        startTime: "09:00",
        endTime: "16:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Rumtek Monastery Main Courtyard",
        coordinates: {
            latitude: 27.3017,
            longitude: 88.5700
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "Comfortable clothing, layers recommended",
        guidelines: [
            "Witness the spectacular Warrior Dance",
            "Photography allowed throughout",
            "Arrive early for good viewing positions",
            "Respect the cultural significance of performances"
        ],
        maxAttendees: 3000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800",
            caption: "Phang Lhabsol Warrior Dance at Rumtek",
            isPrimary: true
        }],
        tags: ["Phang Lhabsol", "Warrior Dance", "Kanchenjunga", "Sikkim Unique"],
        status: "Upcoming",
        featured: true
    },

    // LOSOONG - Sikkimese New Year
    {
        eventName: "Losoong - Sikkimese New Year",
        eventNameTranslations: {
            hindi: "लोसूंग - सिक्किमी नववर्ष",
            tibetan: "ལོ་གསར་སོང་།",
            nepali: "लोसूङ्ग - सिक्किमी नयाँ वर्ष"
        },
        description: "Losoong marks the end of the harvest season and the beginning of the new year for the Bhutia community. Celebrations include traditional Cham dances, archery competitions, and cultural performances showcasing Sikkimese heritage.",
        culturalSignificance: "Losoong is a time of thanksgiving for a bountiful harvest and prayers for prosperity in the coming year. It's deeply rooted in the agrarian traditions of Sikkim.",
        eventType: "Festival",
        eventCategory: "Cultural",
        monasteryId: "enchey001",
        monasteryName: "Enchey Monastery",
        startDate: new Date('2026-12-18'),
        endDate: new Date('2026-12-18'),
        startTime: "08:00",
        endTime: "17:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Enchey Monastery, Gangtok",
        coordinates: {
            latitude: 27.3389,
            longitude: 88.6245
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        contactPhone: "+91-3592-204688",
        dressCode: "Warm clothing (winter festival)",
        guidelines: [
            "Experience traditional Sikkimese culture",
            "Try local cuisine and chang (traditional beverage)",
            "Participate in archery demonstrations",
            "Dress warmly - December weather is cold"
        ],
        maxAttendees: 1500,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
            caption: "Losoong celebrations at Enchey Monastery",
            isPrimary: true
        }],
        tags: ["Losoong", "Sikkimese New Year", "Harvest Festival", "Cultural"],
        status: "Upcoming",
        featured: true
    },

    // BUMCHU - Sacred Pot Opening Ceremony at Tashiding
    {
        eventName: "Bumchu - Sacred Vase Prophecy",
        eventNameTranslations: {
            hindi: "बुमचू - पवित्र घड़ा भविष्यवाणी",
            tibetan: "བུམ་ཆུ།",
            nepali: "बुमचू - पवित्र कलश"
        },
        description: "Bumchu is one of Sikkim's most sacred and mysterious festivals. A holy vase filled with water by Guru Padmasambhava centuries ago is opened once a year on the 15th day of the first Tibetan month. The water level predicts the year ahead - full means prosperity, low means drought or troubles. This highly revered ceremony draws thousands of pilgrims.",
        culturalSignificance: "According to legend, Guru Padmasambhava blessed this vase in the 8th century. The prophecy has been remarkably accurate over centuries, making it one of the most spiritually significant events in Sikkim.",
        eventType: "Ceremony",
        eventCategory: "Religious",
        monasteryId: "tashiding001",
        monasteryName: "Tashiding Monastery",
        startDate: new Date('2026-03-05'),
        endDate: new Date('2026-03-05'),
        startTime: "05:00",
        endTime: "12:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Tashiding Monastery Main Temple",
        coordinates: {
            latitude: 27.3504,
            longitude: 88.2651
        },
        region: "West Sikkim",
        touristAccess: "Yes",
        accessRestrictions: "Very crowded - maintain orderly queue. Photography strictly prohibited inside temple.",
        bookingRequired: "No",
        contactPhone: "+91-3595-264045",
        dressCode: "Traditional or respectful clothing. Warm layers recommended (early morning).",
        guidelines: [
            "Arrive very early - crowds gather from 4 AM",
            "No photography inside the temple",
            "Follow the queue system strictly",
            "The ceremony is brief but deeply sacred",
            "Blessed water is distributed - bring a small container",
            "Steep climb to monastery - moderate fitness required"
        ],
        maxAttendees: 10000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
            caption: "Sacred Bumchu ceremony at Tashiding Monastery",
            isPrimary: true
        }],
        tags: ["Bumchu", "Sacred Vase", "Guru Padmasambhava", "Prophecy", "Tashiding"],
        status: "Upcoming",
        featured: true
    },

    // TENDONG LHO RUM FAAT - Lepcha Festival
    {
        eventName: "Tendong Lho Rum Faat",
        eventNameTranslations: {
            nepali: "तेन्दोङ ल्हो रुम फात"
        },
        description: "Tendong Lho Rum Faat is a traditional Lepcha festival celebrating Mount Tendong, which according to legend saved the Lepcha people during the great deluge. The festival features traditional Lepcha dances, prayers, and cultural programs.",
        culturalSignificance: "This festival commemorates the Lepcha creation mythology and their deep connection with nature and mountains. It's a celebration of Lepcha identity and heritage.",
        eventType: "Festival",
        eventCategory: "Cultural",
        monasteryId: "dubdi001",
        monasteryName: "Dubdi Monastery",
        startDate: new Date('2026-08-08'),
        endDate: new Date('2026-08-08'),
        startTime: "09:00",
        endTime: "16:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Dubdi Monastery and Tendong Hill Area",
        coordinates: {
            latitude: 27.2895,
            longitude: 88.2553
        },
        region: "West Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "Comfortable hiking attire",
        guidelines: [
            "Experience authentic Lepcha culture",
            "Moderate trek to monastery",
            "Respect indigenous traditions",
            "Try traditional Lepcha cuisine"
        ],
        maxAttendees: 500,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            caption: "Tendong Lho Rum Faat celebrations",
            isPrimary: true
        }],
        tags: ["Lepcha", "Tendong", "Indigenous", "Cultural Heritage"],
        status: "Upcoming",
        featured: false
    },

    // Daily Morning Prayers - Multiple Monasteries
    {
        eventName: "Morning Prayer Ceremony",
        eventNameTranslations: {
            hindi: "प्रातः प्रार्थना समारोह",
            tibetan: "སྔ་དྲོའི་གསོལ་འདེབས།"
        },
        description: "Daily morning prayers performed by resident monks featuring traditional Tibetan chants, horn and cymbal music, meditation, and offering rituals. Visitors are welcome to observe and experience the serene spiritual atmosphere.",
        eventType: "Prayer Session",
        eventCategory: "Religious",
        monasteryId: "rumtek001",
        monasteryName: "Rumtek Monastery",
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        startTime: "06:00",
        endTime: "08:00",
        isRecurring: true,
        recurrencePattern: "Daily",
        venueLocation: "Main Prayer Hall",
        coordinates: {
            latitude: 27.3017,
            longitude: 88.5700
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "Modest clothing, remove shoes",
        guidelines: [
            "Arrive 10-15 minutes early",
            "Sit quietly and respectfully",
            "No photography during prayers",
            "Turn off mobile phones",
            "Exit quietly if you must leave"
        ],
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
            caption: "Morning prayer session",
            isPrimary: true
        }],
        tags: ["Daily", "Prayer", "Meditation", "Spiritual Practice"],
        status: "Upcoming",
        featured: false
    },

    // KAGYAT DANCE - Enchey Monastery
    {
        eventName: "Kagyat Dance Festival",
        eventNameTranslations: {
            hindi: "काग्यात नृत्य महोत्सव",
            tibetan: "སྐ་རྒྱད།"
        },
        description: "The Kagyat Dance is performed on the 28th and 29th day of the Tibetan calendar year to dispel evil spirits and usher in prosperity. Monks perform ritual dances depicting various protective deities and the victory of good over evil.",
        culturalSignificance: "This ancient ritual dance tradition helps ward off negative forces and bring blessings for the coming year.",
        eventType: "Festival",
        eventCategory: "Religious",
        monasteryId: "enchey001",
        monasteryName: "Enchey Monastery",
        startDate: new Date('2026-03-28'),
        endDate: new Date('2026-03-29'),
        startTime: "09:00",
        endTime: "16:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Enchey Monastery Courtyard",
        coordinates: {
            latitude: 27.3389,
            longitude: 88.6245
        },
        region: "East Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "Comfortable clothing",
        guidelines: [
            "Two-day festival - attend both days if possible",
            "Photography allowed from designated areas",
            "Respect the sacred nature of ritual dances"
        ],
        maxAttendees: 1000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
            caption: "Kagyat Dance at Enchey Monastery",
            isPrimary: true
        }],
        tags: ["Kagyat", "Ritual Dance", "Enchey", "Annual Festival"],
        status: "Upcoming",
        featured: false
    },

    // BUDDHA JAYANTI - Pan-Buddhist Festival
    {
        eventName: "Buddha Jayanti - Buddha's Birthday",
        eventNameTranslations: {
            hindi: "बुद्ध जयंती",
            tibetan: "སངས་རྒྱས་སྐུ་འཁྲུངས།",
            nepali: "बुद्ध जयन्ती"
        },
        description: "Buddha Jayanti celebrates the birth of Lord Buddha with special prayers, processions, butter lamp offerings, and charitable activities. Monasteries are decorated with prayer flags and flowers, and pilgrims gather for merit-making activities.",
        culturalSignificance: "This sacred day commemorates the birth of Siddhartha Gautama, who became Buddha. It's observed with joy and devotion across all Buddhist communities.",
        eventType: "Festival",
        eventCategory: "Religious",
        monasteryId: "pemayangtse001",
        monasteryName: "Pemayangtse Monastery",
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-05-26'),
        startTime: "05:00",
        endTime: "20:00",
        isRecurring: true,
        recurrencePattern: "Yearly",
        venueLocation: "Pemayangtse Monastery Complex",
        coordinates: {
            latitude: 27.3207,
            longitude: 88.2625
        },
        region: "West Sikkim",
        touristAccess: "Yes",
        bookingRequired: "No",
        dressCode: "White or light-colored traditional clothing preferred",
        guidelines: [
            "Join morning procession",
            "Participate in butter lamp offerings",
            "Vegetarian meals served to all",
            "Acts of charity encouraged"
        ],
        maxAttendees: 2000,
        entryFee: "Free",
        images: [{
            url: "https://images.unsplash.com/photo-1604608672516-9f3a791ff87e?w=800",
            caption: "Buddha Jayanti celebrations",
            isPrimary: true
        }],
        tags: ["Buddha Jayanti", "Buddha's Birthday", "Vesak", "Religious"],
        status: "Upcoming",
        featured: false
    }
];

// Seed function
async function seedEvents() {
    try {
        // Clear existing events
        await Event.deleteMany({});
        console.log('🗑️ Cleared existing events');

        // Insert events
        const inserted = await Event.insertMany(annualEvents);
        console.log(`✅ Successfully seeded ${inserted.length} events`);

        // Display summary
        console.log('\n📊 Event Summary:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Total Events: ${inserted.length}`);
        console.log(`Featured Events: ${inserted.filter(e => e.featured).length}`);
        console.log(`\n📍 By Region:`);
        const regions = [...new Set(inserted.map(e => e.region))];
        regions.forEach(region => {
            const count = inserted.filter(e => e.region === region).length;
            console.log(`  - ${region}: ${count} events`);
        });
        console.log(`\n🏛️ By Monastery:`);
        const monasteries = [...new Set(inserted.map(e => e.monasteryName))];
        monasteries.forEach(monastery => {
            const count = inserted.filter(e => e.monasteryName === monastery).length;
            console.log(`  - ${monastery}: ${count} events`);
        });
        console.log(`\n🎭 By Event Type:`);
        const types = [...new Set(inserted.map(e => e.eventType))];
        types.forEach(type => {
            const count = inserted.filter(e => e.eventType === type).length;
            console.log(`  - ${type}: ${count} events`);
        });
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding events:', error);
        process.exit(1);
    }
}

// Run seeder
seedEvents();
