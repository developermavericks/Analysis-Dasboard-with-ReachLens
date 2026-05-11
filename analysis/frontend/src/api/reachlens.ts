
const REACHLENS_API_URL = 'http://localhost:4005/api';

export const analyzeUrl = async (url: string, version: string = 'v5') => {
    const response = await fetch(`${REACHLENS_API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, version }),
    });
    if (!response.ok) {
        throw new Error('Failed to analyze URL');
    }
    return await response.json();
};
