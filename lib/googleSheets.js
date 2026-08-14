import axios from 'axios';

export async function fetchAllSheetData() {
  const url = process.env.APPS_SCRIPT_URL;
  
  try {
    // Setting timeout to 0 (no timeout) to accommodate slow first responses
    // from Google Apps Script
    const response = await axios.get(url, {
      timeout: 0,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching from Apps Script:", error);
    throw new Error(`Apps Script fetch failed: ${error.message}`);
  }
} 