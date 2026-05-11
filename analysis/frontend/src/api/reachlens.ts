
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

export const bulkAnalyzeUrls = async (file: File, version: string = 'v5') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);

    const response = await fetch(`${REACHLENS_API_URL}/bulk-analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to perform bulk analysis');
    }

    return await response.blob();
};
