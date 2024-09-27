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

function displayNews(articles) {
    newsContainer.innerHTML = '';

    if (articles.length === 0) {
        newsContainer.innerHTML = '<p>No valid news articles found. Please try a different search or page.</p>';
        globalArticleCount = 0;
        return;
    }

    globalArticleCount = articles.length;

    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.classList.add('article');

        articleElement.innerHTML = `
            <div class="image-container">
                <div class="image-placeholder"></div>
                <img src="${article.urlToImage}" alt="${article.title}" class="article-image hidden">
            </div>
            <div class="article-content">
                <h2>${article.title}</h2>
                <p>${article.description}</p>
                <p class="source">Source: ${article.source.name}</p>
                <a href="${article.url}" target="_blank" class="read-more">Read more</a>
            </div>
        `;

        const img = articleElement.querySelector('.article-image');
        const placeholder = articleElement.querySelector('.image-placeholder');

        img.onload = () => {
            placeholder.style.display = 'none';
            img.classList.remove('hidden');
        };

        img.onerror = () => {
            img.src = `https://source.unsplash.com/300x200/?${encodeURIComponent(article.title)}`;
        };

        newsContainer.appendChild(articleElement);
    });

    updatePaginationControls();
    updateArticleCount();
}

function updatePaginationControls() {
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function updateArticleCount() {
    articleCountSpan.textContent = globalArticleCount;
}

async function loadNews() {
    newsContainer.innerHTML = '<p>Loading news...</p>';
    const articles = await fetchNews(currentQuery, currentPage);
    displayNews(articles);
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        currentQuery = query;
        currentPage = 1;
        await loadNews();
    }
});

prevPageBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
        currentPage--;
        await loadNews();
    }
});
