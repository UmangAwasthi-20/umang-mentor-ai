/**
 * Fetch with exponential backoff retry logic
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Maximum number of retries (default: 4)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise<Object>} - JSON response
 */
export async function fetchWithRetry(url, options, retries = 4, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful, return the JSON response
      if (response.ok) {
        return await response.json();
      }
      
      // Handle specific error status codes
      if (response.status === 401) {
        throw new Error(`401 - Unauthorized: Invalid API key`);
      } else if (response.status === 429) {
        throw new Error(`429 - Rate limit exceeded`);
      } else if (response.status === 503) {
        throw new Error(`503 - Service unavailable`);
      } else if (response.status >= 500) {
        throw new Error(`${response.status} - Server error`);
      } else {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429
      if (error.message.includes('401') || 
          (error.message.includes('4') && !error.message.includes('429'))) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw new Error(`Failed after ${retries + 1} attempts. Last error: ${error.message}`);
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but just in case
  throw lastError || new Error('Unknown error occurred');
}
  