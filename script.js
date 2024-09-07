// Function to fetch news
async function fetchNews(query = 'Apple', page = 1, pageSize = 20) {
    const url = `${baseUrl}?q=${query}&sortBy=popularity&apiKey=${apiKey}&pageSize=${pageSize}&page=${page}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        totalPages = Math.min(Math.ceil(data.totalResults / pageSize), 50); // Cap at 50 pages
        return data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}
