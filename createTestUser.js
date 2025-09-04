
import { apiService } from './app/services/api';

async function createTestUser() {
  try {
    console.log('Attempting to register user: udi.test@example.com');
    const response = await apiService.register({
      username: 'udi',
      email: 'udi.test@example.com',
      password: 'SmartStart123!'
    });

    if (response.success) {
      console.log('User registered successfully:', response.message);
      console.log('Please use the following credentials to log in:');
      console.log('Email: udi.test@example.com');
      console.log('Password: SmartStart123!');
    } else {
      console.error('User registration failed:', response.message);
    }
  } catch (error) {
    console.error('An error occurred during user registration:', error);
  }
}

createTestUser();

