const express = require('express');
const router = express.Router();
const Archive = require('../models/Archive');

// Get all archives with search
router.get('/', async (req, res) => {
    try {
        const { search, monasteryId, monasteryName, category, page = 1, limit = 20 } = req.query;
        
        let query = { status: 'Published' };
        
        // Search filter
        if (search) {
            query.$or = [
                { monasteryName: new RegExp(search, 'i') },
                { title: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }
        
        // Monastery filter
        if (monasteryId) query.monasteryId = monasteryId;
        if (monasteryName) query.monasteryName = new RegExp(monasteryName, 'i');
        
        // Category filter
        if (category) query.category = category;
        
        console.log('📚 Fetching archives with query:', JSON.stringify(query));
        
        const archives = await Archive.find(query)
            .sort({ publishedDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean() // Use lean for better performance
            .exec();
        
        const count = await Archive.countDocuments(query);
        
        console.log(`✅ Found ${archives.length} archives`);
        
        res.json({
            success: true,
            archives,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalArchives: count
        });
        
    } catch (error) {
        console.error('❌ Error fetching archives:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching archives',
            error: error.message
        });
    }
});

// IMPORTANT: Specific routes must come BEFORE generic /:id route
// Otherwise GET/:id will match before /download/pdf

// Get archive by monastery name
router.get('/monastery/:monasteryName', async (req, res) => {
    try {
        const archives = await Archive.find({
            monasteryName: new RegExp(req.params.monasteryName, 'i'),
            status: 'Published'
        }).lean();
        
        res.json({
            success: true,
            archives,
            count: archives.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching monastery archives:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monastery archives',
            error: error.message
        });
    }
});

// Download archive as PDF (simplified for now)
router.get('/:id/download/pdf', async (req, res) => {
    try {
        const archive = await Archive.findById(req.params.id).lean();
        
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: 'Archive not found'
            });
        }
        
        // Increment download count
        await Archive.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
        
        // Simple text file for now (you can add PDFKit later)
        let content = `${archive.monasteryName}\n${'='.repeat(archive.monasteryName.length)}\n\n`;
        content += `${archive.title}\n\n`;
        content += `${archive.content}\n\n`;
        
        if (archive.sections && archive.sections.length > 0) {
            archive.sections.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(section => {
                content += `\n${section.sectionTitle}\n${'-'.repeat(section.sectionTitle.length)}\n`;
                content += `${section.sectionContent}\n\n`;
            });
        }
        
        content += `\n---\nGenerated from Monastery360 Archives\n`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${archive.monasteryName}-Archive.pdf"`);
        res.send(content);
        
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading PDF',
            error: error.message
        });
    }
});

// Download archive as TXT
router.get('/:id/download/txt', async (req, res) => {
    try {
        const archive = await Archive.findById(req.params.id).lean();
        
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: 'Archive not found'
            });
        }
        
        // Increment download count
        await Archive.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
        
        // Create text content
        let textContent = `${archive.monasteryName}\n`;
        textContent += `${'='.repeat(archive.monasteryName.length)}\n\n`;
        textContent += `${archive.title}\n\n`;
        textContent += `${archive.content}\n\n`;
        
        // Add sections
        if (archive.sections && archive.sections.length > 0) {
            archive.sections.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(section => {
                textContent += `\n${section.sectionTitle}\n`;
                textContent += `${'-'.repeat(section.sectionTitle.length)}\n`;
                textContent += `${section.sectionContent}\n\n`;
            });
        }
        
        textContent += `\n---\nGenerated from Monastery360 Archives\n`;
        textContent += `Downloaded on: ${new Date().toLocaleDateString()}\n`;
        
        // Set response headers
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${archive.monasteryName}-Archive.txt"`);
        
        res.send(textContent);
        
    } catch (error) {
        console.error('❌ Error downloading TXT:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading TXT',
            error: error.message
        });
    }
});

// Get single archive by ID
router.get('/:id', async (req, res) => {
    try {
        const archiveId = req.params.id;
        
        // Validate MongoDB ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(archiveId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid archive ID format'
            });
        }
        
        // Find archive
        const archive = await Archive.findById(archiveId).lean();
        
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: 'Archive not found'
            });
        }
        
        // Increment view count
        await Archive.findByIdAndUpdate(archiveId, { $inc: { views: 1 } });
        
        res.json({
            success: true,
            archive: {
                ...archive,
                views: (archive.views || 0) + 1
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching archive:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching archive',
            error: error.message
        });
    }
});

// Create new archive (Admin)
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        const { monasteryId, title, content, coverImage } = req.body;
        if (!monasteryId || !title || !content || !coverImage) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: monasteryId, title, content, coverImage'
            });
        }

        // Validate MongoDB ObjectId for monasteryId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(monasteryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid monasteryId format'
            });
        }

        const archive = new Archive(req.body);
        await archive.save();
        
        res.status(201).json({
            success: true,
            message: 'Archive created successfully',
            archive
        });
        
    } catch (error) {
        console.error('❌ Error creating archive:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating archive',
            error: error.message
        });
    }
});

// Update archive (Admin)
router.put('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid archive ID format'
            });
        }

        req.body.lastUpdated = Date.now();
        
        const archive = await Archive.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: 'Archive not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Archive updated successfully',
            archive
        });
        
    } catch (error) {
        console.error('❌ Error updating archive:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating archive',
            error: error.message
        });
    }
});

// Delete archive (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid archive ID format'
            });
        }

        const archive = await Archive.findByIdAndDelete(req.params.id);
        
        if (!archive) {
            return res.status(404).json({
                success: false,
                message: 'Archive not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Archive deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting archive:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting archive',
            error: error.message
        });
    }
});

module.exports = router;
