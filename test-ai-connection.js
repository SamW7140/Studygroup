// Quick test script to verify AI service connection
const AI_SERVICE_URL = 'http://localhost:8000'

async function testConnection() {
  console.log('🔍 Testing AI Service Connection...\n')
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...')
    const healthResponse = await fetch(`${AI_SERVICE_URL}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', JSON.stringify(healthData, null, 2))
    console.log('')
    
    // Test 2: Root endpoint
    console.log('2️⃣ Testing root endpoint...')
    const rootResponse = await fetch(`${AI_SERVICE_URL}/`)
    const rootData = await rootResponse.json()
    console.log('✅ Root endpoint:', JSON.stringify(rootData, null, 2))
    console.log('')
    
    // Test 3: Query endpoint (with sample data)
    console.log('3️⃣ Testing query endpoint...')
    const queryResponse = await fetch(`${AI_SERVICE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class_id: 'test-class-123',
        question: 'What is this course about?',
        user_id: 'test-user'
      })
    })
    
    console.log('Query response status:', queryResponse.status)
    const queryData = await queryResponse.json()
    console.log('Query response:', JSON.stringify(queryData, null, 2))
    console.log('')
    
    console.log('✅ All tests completed!')
    console.log('\n🎉 AI Service is running and responding correctly!')
    
  } catch (error) {
    console.error('❌ Connection test failed:')
    console.error(error.message)
    console.log('\n📝 Troubleshooting:')
    console.log('1. Make sure the AI service is running on port 8000')
    console.log('2. Check that CORS is configured to allow requests from localhost')
    console.log('3. Verify your .env.local has: AI_SERVICE_URL=http://localhost:8000')
  }
}

testConnection()
