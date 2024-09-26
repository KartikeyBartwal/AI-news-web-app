// API key and base URL
const apiKey = 'api_key';
const baseUrl = 'https://newsapi.org/v2/everything';

// DOM elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const newsContainer = document.getElementById('news-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');

// Pagination state
let currentPage = 1;
let totalPages = 1;
let currentQuery = 'Apple';

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

function processArticles(articles) {
    return articles.filter(article => {
        if (!article.title || !article.description || !article.url) {
            return false;
        }

        if (article.title.toLowerCase().includes('removed') || 
            article.description.toLowerCase().includes('removed') ||
            article.title.trim() === '' || 
            article.description.trim() === '') {
            return false;
        }

        // Try to extract an image from the content if urlToImage is not provided
        if (!article.urlToImage && article.content) {
            const imgMatch = article.content.match(/<img[^>]+src="?([^"\s]+)"?\s*/);
            if (imgMatch) {
                article.urlToImage = imgMatch[1];
            }
        }

        // If still no image, use a more appealing placeholder
        if (!article.urlToImage) {
            article.urlToImage = `https://source.unsplash.com/300x200/?${encodeURIComponent(article.title)}`;
        }

        return true;
    });
}