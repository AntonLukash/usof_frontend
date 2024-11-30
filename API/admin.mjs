import AdminJS from 'adminjs';
import AdminJSSQL, { Database, Resource } from '@adminjs/sql';
import AdminJSExpress from '@adminjs/express';
import bcrypt from 'bcrypt';
import createConnection from './db.js';
import fs from 'fs';

AdminJS.registerAdapter({ Database, Resource });

const dbConfig = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));

const dbConnection = await new AdminJSSQL('mysql2', {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: 3306,
}).init();

const adminJs = new AdminJS({
    databases: [dbConnection],
    rootPath: '/admin',
    branding: {
        companyName: 'InquireNet Admin Panel',
        logo: false,
        softwareBrothers: false,
        favicon: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20100%20100%27%3E%3Cg%20transform%3D%27translate(50%2C50)%27%3E%3Ccircle%20cx%3D%270%27%20cy%3D%27-30%27%20r%3D%2710%27%20fill%3D%27black%27%2F%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%270%27%20r%3D%2710%27%20fill%3D%27black%27%2F%3E%3Ccircle%20cx%3D%270%27%20cy%3D%2730%27%20r%3D%2710%27%20fill%3D%27black%27%2F%3E%3Ccircle%20cx%3D%27-30%27%20cy%3D%270%27%20r%3D%2710%27%20fill%3D%27black%27%2F%3E%3Ccircle%20cx%3D%270%27%20cy%3D%270%27%20r%3D%276%27%20fill%3D%27black%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E'
    }
});


const authenticate = async (email, password) => {
    const db = await createConnection();
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    const user = rows[0];

    if (user && user.role === 'admin') {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            await db.end();
            return user;
        }
    }
    await db.end();
    return null;
};

const router = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret',
    }
);

export default router;
