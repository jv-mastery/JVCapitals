// Simple test file to verify API integration
import apiService from './api.js';

// Test functions
export const testAPI = async () => {
  console.log('Testing API integration...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    console.log('Health check:', health);
    
    // Test registration
    console.log('2. Testing registration...');
    try {
      const registerResponse = await apiService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123456'
      });
      console.log('Registration successful:', registerResponse);
    } catch (error) {
      console.log('Registration failed (expected if user exists):', error.message);
    }
    
    // Test login
    console.log('3. Testing login...');
    try {
      const loginResponse = await apiService.login('test@example.com', 'test123456');
      console.log('Login successful:', loginResponse);
    } catch (error) {
      console.log('Login failed:', error.message);
    }
    
    // Test get current user
    console.log('4. Testing get current user...');
    try {
      const userResponse = await apiService.getCurrentUser();
      console.log('Current user:', userResponse);
    } catch (error) {
      console.log('Get current user failed:', error.message);
    }
    
    console.log('API integration test completed!');
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Export for use in browser console
window.testAPI = testAPI;
