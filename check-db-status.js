// Database connection status checker
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  console.log('🔍 Checking Database Connection Status...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test 2: Simple query
    console.log('\n2. Testing database query...');
    const startTime = Date.now();
    const userCount = await prisma.user.count();
    const queryTime = Date.now() - startTime;
    console.log(`✅ Query successful: Found ${userCount} users (${queryTime}ms)`);
    
    // Test 3: Write operation
    console.log('\n3. Testing write operation...');
    const writeStart = Date.now();
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true }
    });
    const writeTime = Date.now() - writeStart;
    console.log(`✅ Read operation successful (${writeTime}ms)`);
    
    // Test 4: Connection health
    console.log('\n4. Connection Health Check:');
    if (queryTime < 1000 && writeTime < 1000) {
      console.log('✅ Database connection is STABLE and FAST');
      console.log('🎯 Your authentication system is ready to use!');
    } else if (queryTime < 5000 && writeTime < 5000) {
      console.log('⚠️  Database connection is SLOW but working');
      console.log('📝 Consider checking network or MongoDB Atlas performance');
    } else {
      console.log('❌ Database connection is UNSTABLE');
      console.log('🔧 Check your MongoDB Atlas connection and network');
    }
    
    // Test 5: Environment check
    console.log('\n5. Environment Check:');
    console.log(`📍 MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'MISSING'}`);
    console.log(`🔐 Session Secret: ${process.env.SESSION_SECRET ? 'Configured' : 'MISSING'}`);
    
    await prisma.$disconnect();
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection FAILED:');
    console.error('Error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('🔧 Issue: Connection timeout');
      console.log('💡 Solution: Check network, firewall, or MongoDB Atlas status');
    } else if (error.message.includes('authentication')) {
      console.log('🔐 Issue: Authentication failed');
      console.log('💡 Solution: Check MongoDB credentials in .env');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🌐 Issue: DNS resolution failed');
      console.log('💡 Solution: Check MongoDB URI and internet connection');
    } else {
      console.log('❓ Issue: Unknown error');
      console.log('💡 Solution: Check MongoDB Atlas dashboard and logs');
    }
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Failed to disconnect:', disconnectError.message);
    }
  }
}

checkDatabaseStatus();
