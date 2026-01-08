const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('=== DhanRaksha API Tests ===\n');

    // Test 1: Root endpoint
    console.log('1. Testing root endpoint (GET /)');
    const rootResponse = await makeRequest('GET', '/');
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Response:`, rootResponse.data);
    console.log('');

    // Test 2: Register a new user
    console.log('2. Testing user registration (POST /api/auth/register)');
    const registerData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };
    const registerResponse = await makeRequest('POST', '/api/auth/register', registerData);
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response:`, registerResponse.data);
    console.log('');

    let token = null;
    if (registerResponse.status === 201) {
        token = registerResponse.data.token;
        console.log('   ✓ User registered successfully!');
        console.log('');

        // Test 3: Get user profile
        console.log('3. Testing get profile (GET /api/auth/me)');
        const profileResponse = await makeRequest('GET', '/api/auth/me');
        console.log(`   Without token - Status: ${profileResponse.status}`);
        console.log(`   Response:`, profileResponse.data);
        console.log('');

        // Test 4: Create a category
        console.log('4. Testing create category (POST /api/categories)');
        const categoryData = {
            name: 'Food & Dining',
            type: 'expense',
            icon: 'restaurant',
            color: '#EF4444'
        };

        const categoryResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5001,
                path: '/api/categories',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });

            req.on('error', reject);
            req.write(JSON.stringify(categoryData));
            req.end();
        });

        console.log(`   Status: ${categoryResponse.status}`);
        console.log(`   Response:`, categoryResponse.data);
        console.log('');

        if (categoryResponse.status === 201) {
            console.log('   ✓ Category created successfully!');
            console.log('');

            // Test 5: Create an account
            console.log('5. Testing create account (POST /api/accounts)');
            const accountData = {
                name: 'Main Wallet',
                type: 'cash',
                balance: 10000,
                currency: 'INR',
                color: '#10B981'
            };

            const accountResponse = await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'localhost',
                    port: 5001,
                    path: '/api/accounts',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };

                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            resolve({ status: res.statusCode, data: JSON.parse(data) });
                        } catch (e) {
                            resolve({ status: res.statusCode, data: data });
                        }
                    });
                });

                req.on('error', reject);
                req.write(JSON.stringify(accountData));
                req.end();
            });

            console.log(`   Status: ${accountResponse.status}`);
            console.log(`   Response:`, accountResponse.data);
            console.log('');

            if (accountResponse.status === 201) {
                console.log('   ✓ Account created successfully!');
                console.log('');
            }
        }
    }

    console.log('=== Tests Complete ===');
}

runTests().catch(console.error);
