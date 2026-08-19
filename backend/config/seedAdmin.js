const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedSuperAdmin = async () => {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL || 'portaljob54@gmail.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

        const adminExists = await User.findOne({ role: 'superadmin' });
        
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const superAdmin = new User({
                name: 'Super Admin',
                email: email,
                password: hashedPassword,
                role: 'superadmin',
                isVerified: true
            });

            await superAdmin.save();
            console.log(`✅ Default Super Admin created! Email: ${email}`);
        } else {
            console.log('⚡ Super Admin already exists.');
        }
    } catch (err) {
        console.error('❌ Error seeding Super Admin:', err);
    }
};

module.exports = seedSuperAdmin;
