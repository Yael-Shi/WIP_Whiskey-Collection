import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * Handles deleting a tasting from the server.
 * Requires an authentication token (JWT) in the Authorization header.
 *
 * @param {string} tastingId - The ID of the tasting to delete.
 * @returns {Promise<boolean>} - A Promise that resolves to true if deletion is successful, or throws an error otherwise.
 */
export const deleteTastingApiCall = async (tastingId) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('User not authenticated. Please log in.');
    }

    const url = `${API_BASE_URL}/tastings/${tastingId}`;

    console.log(`Sending DELETE request to: ${url}`);
    console.log(
      `With Authorization Bearer Token: ${token.substring(0, 30)}...`,
    );

    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Tasting deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error deleting tasting:', error);
    if (error.response) {
      const errorMessage =
        error.response.data.detail ||
        error.response.data.message ||
        'Failed to delete tasting.';
      console.error('Server error details:', error.response.data);
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        'No response from server. Please check your internet connection or server status.',
      );
    } else {
      throw new Error(
        error.message ||
          'An unexpected error occurred during the delete operation.',
      );
    }
  }
};
