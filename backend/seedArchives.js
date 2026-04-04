const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Archive Schema
const archiveSchema = new mongoose.Schema({
    monasteryId: String,
    monasteryName: String,
    title: String,
    content: String,
    contentTranslations: {
        hindi: String,
        tibetan: String,
        nepali: String,
        dzongkha: String
    },
    audioGuide: {
        english: String,
        hindi: String,
        tibetan: String,
        nepali: String
    },
    sections: [{
        sectionTitle: String,
        sectionContent: String,
        order: Number
    }],
    foundedYear: String,
    founder: String,
    lineage: String,
    historicalSignificance: String,
    architecture: {
        style: String,
        description: String,
        notableFeatures: [String]
    },
    artworks: [{
        name: String,
        description: String,
        imageUrl: String
    }],
    traditions: [String],
    festivals: [String],
    rituals: [String],
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    coverImage: String,
    location: {
        address: String,
        region: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    tags: [String],
    category: String,
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    status: String,
    publishedDate: Date,
    lastUpdated: Date
}, { timestamps: true });

const Archive = mongoose.model('Archive', archiveSchema);

// Sample Archives Data
const sampleArchives = [
    {
        monasteryId: 'rumtek001',
        monasteryName: 'Rumtek Monastery',
        title: 'The Sacred Seat of the Karmapa',
        content: `Rumtek Monastery, located 24 km from Gangtok on a scenic hilltop, stands as the largest and most significant monastery in Sikkim. Established in 1966 by His Holiness the 16th Gyalwa Karmapa, it serves as the seat of the Karma Kagyu lineage of Tibetan Buddhism. The monastery is a faithful replica of the original Tsurphu Monastery in Tibet, featuring a four-story main structure fortified by monks' quarters.

The drive to Rumtek passes through terraced paddy fields and offers breathtaking views of Gangtok and the surrounding hills. The monastery's entrance features a striking archway adorned with murals depicting deities and protective spirits. The main temple houses precious religious artifacts, including the Golden Stupa containing relics of the 16th Karmapa, exquisite murals, intricate thangkas, and a revered statue of Sakyamuni Buddha.

[LEAVE SPACE FOR MORE DETAILED CONTENT TO BE FILLED LATER]`,
        
        contentTranslations: {
            hindi: 'रुमटेक मठ, गंगटोक से 24 किमी दूर एक सुंदर पहाड़ी पर स्थित है, सिक्किम का सबसे बड़ा और सबसे महत्वपूर्ण मठ है।',
            nepali: 'रुमटेक मठ, गान्तोकबाट २४ किमी टाढा एक रमणीय पहाडमा अवस्थित, सिक्किमको सबैभन्दा ठूलो र महत्त्वपूर्ण गुम्बा हो।'
        },
        
        sections: [
            {
                sectionTitle: 'History and Foundation',
                sectionContent: '[TO BE FILLED - History of Rumtek Monastery, founding by 16th Karmapa, connection to Tsurphu Monastery in Tibet]',
                order: 1
            },
            {
                sectionTitle: 'Architecture and Layout',
                sectionContent: '[TO BE FILLED - Detailed description of the monastery architecture, main temple, prayer halls, monks quarters, surrounding structures]',
                order: 2
            },
            {
                sectionTitle: 'Religious Significance',
                sectionContent: '[TO BE FILLED - Importance in Karma Kagyu lineage, role in preserving Tibetan Buddhism, spiritual teachings]',
                order: 3
            },
            {
                sectionTitle: 'Sacred Artifacts and Art',
                sectionContent: '[TO BE FILLED - Description of Golden Stupa, murals, thangkas, statues, religious treasures]',
                order: 4
            },
            {
                sectionTitle: 'Monastic Life',
                sectionContent: '[TO BE FILLED - Daily routines of monks, prayer sessions, study programs, religious practices]',
                order: 5
            }
        ],
        
        foundedYear: '1966',
        founder: '16th Gyalwa Karmapa',
        lineage: 'Karma Kagyu',
        historicalSignificance: '[TO BE FILLED - Detailed historical significance, role in Tibetan Buddhism diaspora, preservation of traditions]',
        
        architecture: {
            style: 'Tibetan Buddhist Architecture',
            description: '[TO BE FILLED - Architectural features, design elements, construction details]',
            notableFeatures: [
                'Four-story main structure',
                'Golden Stupa',
                'Elaborate murals and thangkas',
                'Prayer wheels',
                'Monks quarters'
            ]
        },
        
        traditions: [
            'Karma Kagyu teachings',
            'Daily prayer ceremonies',
            'Tibetan Buddhist rituals',
            'Meditation practices'
        ],
        
        festivals: [
            'Losar - Tibetan New Year',
            'Saga Dawa',
            'Phang Lhabsol'
        ],
        
        rituals: [
            'Morning prayers',
            'Butter lamp offerings',
            'Circumambulation',
            'Cham dances'
        ],
        
        coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
        
        images: [
            {
                url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
                caption: 'Rumtek Monastery main temple',
                isPrimary: true
            }
        ],
        
        location: {
            address: 'Rumtek, East Sikkim',
            region: 'East Sikkim',
            coordinates: {
                latitude: 27.3017,
                longitude: 88.5700
            }
        },
        
        tags: ['Rumtek', 'Karma Kagyu', 'Karmapa', 'Buddhism', 'Sikkim'],
        category: 'History',
        status: 'Published',
        publishedDate: new Date(),
        lastUpdated: new Date()
    },
    
    {
        monasteryId: 'pemayangtse001',
        monasteryName: 'Pemayangtse Monastery',
        title: 'The Perfect Sublime Lotus',
        content: `Pemayangtse Monastery, meaning "Perfect Sublime Lotus," is one of the oldest and most important monasteries in Sikkim. Founded in 1705 by Lhatsun Chempo, it belongs to the Nyingma order of Tibetan Buddhism and was originally meant only for "ta-tshang" (pure Bhutia) monks.

Located at an altitude of 2,085 meters near Pelling in West Sikkim, the three-story monastery offers spectacular views of the Kanchenjunga range. The monastery complex features ancient murals, sacred texts, and a remarkable seven-tiered wooden model of Guru Padmasambhava's celestial palace called Sanghthokpalri.

[LEAVE SPACE FOR MORE DETAILED CONTENT TO BE FILLED LATER]`,
        
        sections: [
            {
                sectionTitle: 'Foundation and Early History',
                sectionContent: '[TO BE FILLED - Founding by Lhatsun Chempo, early years, royal patronage]',
                order: 1
            },
            {
                sectionTitle: 'The Nyingma Tradition',
                sectionContent: '[TO BE FILLED - Significance in Nyingma lineage, teachings, practices]',
                order: 2
            },
            {
                sectionTitle: 'Architectural Marvel',
                sectionContent: '[TO BE FILLED - Building structure, Sanghthokpalri model, artwork]',
                order: 3
            }
        ],
        
        foundedYear: '1705',
        founder: 'Lhatsun Chempo',
        lineage: 'Nyingma',
        historicalSignificance: '[TO BE FILLED]',
        
        architecture: {
            style: 'Traditional Sikkimese Buddhist',
            description: '[TO BE FILLED]',
            notableFeatures: [
                'Three-story structure',
                'Sanghthokpalri wooden model',
                'Ancient murals',
                'Prayer halls'
            ]
        },
        
        coverImage: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800',
        
        location: {
            address: 'Pelling, West Sikkim',
            region: 'West Sikkim',
            coordinates: {
                latitude: 27.3207,
                longitude: 88.2625
            }
        },
        
        tags: ['Pemayangtse', 'Nyingma', 'Guru Padmasambhava', 'West Sikkim'],
        category: 'History',
        status: 'Published',
        publishedDate: new Date(),
        lastUpdated: new Date()
    },
    
    {
        monasteryId: 'enchey001',
        monasteryName: 'Enchey Monastery',
        title: 'The Solitary Temple Above Gangtok',
        content: `Enchey Monastery, meaning "Solitary Temple," sits atop a hill overlooking Gangtok. Built in 1909, it belongs to the Nyingma order and is believed to be built on a site blessed by Lama Druptob Karpo, a tantric master known for his flying powers.

The monastery hosts the annual Chaam dance during the Kagyat festival, where monks perform sacred masked dances depicting the victory of good over evil.

[LEAVE SPACE FOR MORE DETAILED CONTENT TO BE FILLED LATER]`,
        
        foundedYear: '1909',
        founder: 'Lama Druptob Karpo',
        lineage: 'Nyingma',
        
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        
        location: {
            address: 'Gangtok, East Sikkim',
            region: 'East Sikkim',
            coordinates: {
                latitude: 27.3389,
                longitude: 88.6245
            }
        },
        
        tags: ['Enchey', 'Gangtok', 'Nyingma', 'Chaam Dance'],
        category: 'Culture',
        status: 'Published',
        publishedDate: new Date(),
        lastUpdated: new Date()
    },
    
    {
        monasteryId: 'tashiding001',
        monasteryName: 'Tashiding Monastery',
        title: 'The Sacred Heart of Sikkim',
        content: `Tashiding Monastery, built in 1716, is one of the most sacred monasteries in Sikkim. Located on a conical hill between the Rangit and Rathong rivers, it is believed to be blessed by Guru Padmasambhava himself.

The monastery is famous for the annual Bumchu ceremony where a sacred vase filled with holy water is opened to predict the year ahead.

[LEAVE SPACE FOR MORE DETAILED CONTENT TO BE FILLED LATER]`,
        
        foundedYear: '1716',
        lineage: 'Nyingma',
        
        coverImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
        
        location: {
            address: 'Tashiding, West Sikkim',
            region: 'West Sikkim',
            coordinates: {
                latitude: 27.3504,
                longitude: 88.2651
            }
        },
        
        tags: ['Tashiding', 'Bumchu', 'Sacred', 'Guru Padmasambhava'],
        category: 'Spiritual',
        status: 'Published',
        publishedDate: new Date(),
        lastUpdated: new Date()
    }
];

// Seed function
async function seedArchives() {
    try {
        // Clear existing archives
        await Archive.deleteMany({});
        console.log('🗑️ Cleared existing archives');

        // Insert sample archives
        const inserted = await Archive.insertMany(sampleArchives);
        console.log(`✅ Successfully seeded ${inserted.length} archives`);

        // Display summary
        console.log('\n📊 Archive Summary:');
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Total Archives: ${inserted.length}`);
        console.log(`\n🏛️ By Monastery:`);
        inserted.forEach(archive => {
            console.log(`  - ${archive.monasteryName}`);
        });
        console.log(`\n📍 By Region:`);
        const regions = [...new Set(inserted.map(a => a.location.region))];
        regions.forEach(region => {
            const count = inserted.filter(a => a.location.region === region).length;
            console.log(`  - ${region}: ${count} archive(s)`);
        });
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding archives:', error);
        process.exit(1);
    }
}

// Run seeder
seedArchives();
