import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const fetchWhiskeyByIdApiCall = async (whiskeyId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('User not authenticated. Please log in.');
    }

    const url = `${API_BASE_URL}/whiskeys/${whiskeyId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching whiskey:', error);
    if (error.response) {
      const errorMessage =
        error.response.data.detail ||
        error.response.data.message ||
        'Failed to fetch whiskey.';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        'No response from server. Please check your internet connection or server status.',
      );
    } else {
      throw new Error(
        error.message ||
          'An unexpected error occurred during the fetch operation.',
      );
    }
  }
};

export const deleteWhiskeyApiCall = async (whiskeyId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('User not authenticated. Please log in.');
    }

    const url = `${API_BASE_URL}/whiskeys/${whiskeyId}`;
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting whiskey:', error);
    if (error.response) {
      const errorMessage =
        error.response.data.detail ||
        error.response.data.message ||
        'Failed to delete whiskey.';
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
