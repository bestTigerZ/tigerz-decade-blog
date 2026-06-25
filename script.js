// ========== 基础功能 ==========

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 返回顶部按钮
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.remove('opacity-0', 'invisible');
        backToTop.classList.add('opacity-100', 'visible');
    } else {
        backToTop.classList.add('opacity-0', 'invisible');
        backToTop.classList.remove('opacity-100', 'visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 导航栏滚动效果 — 始终保持玻璃背景
const nav = document.querySelector('nav');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(0, 180, 216, 0.12)';
        nav.style.backdropFilter = 'blur(16px)';
        nav.style.WebkitBackdropFilter = 'blur(16px)';
        nav.style.borderBottom = '1px solid rgba(0, 212, 255, 0.3)';
    } else {
        nav.style.background = 'rgba(0, 180, 216, 0.08)';
        nav.style.backdropFilter = 'blur(16px)';
        nav.style.WebkitBackdropFilter = 'blur(16px)';
        nav.style.borderBottom = '1px solid rgba(0, 212, 255, 0.2)';
    }
});

// 移动端菜单切换
mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('hidden');
    if (isOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.textContent = '✕';
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.textContent = '☰';
        document.body.style.overflow = '';
    }
});

function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.textContent = '☰';
    document.body.style.overflow = '';
}

// 添加随机星星效果
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDelay = Math.random() * 2.5 + 's';
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 5000);
}

setInterval(createSparkle, 800);

// 留言类型按钮切换
const typeButtons = document.querySelectorAll('form button[type="button"]');
typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        typeButtons.forEach(b => {
            b.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/30');
            b.classList.add('bg-white/5', 'text-gray-400', 'border-white/10');
        });
        btn.classList.remove('bg-white/5', 'text-gray-400', 'border-white/10');
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/30');
    });
});

// ========== Lightbox 图片放大查看 ==========
let currentImageIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    const img = galleryImageList[currentImageIndex];
    if (img) {
        lightboxImg.src = img.src;
        lightboxTitle.textContent = img.title;
        lightboxDesc.textContent = img.desc;
    }
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImageList.length) % galleryImageList.length;
    updateLightboxImage();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImageList.length;
    updateLightboxImage();
}

// 点击背景关闭
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    }
});

// ========== 博客系统（动态加载） ==========

// 全局变量
let allArticles = [];           // 所有文章
let filteredArticles = [];      // 筛选后的文章
let currentPage = 0;            // 当前页码
const pageSize = 6;             // 每页显示数量
let currentCategory = '全部';   // 当前选中的分类

// 分类对应的图标和颜色
const categoryConfig = {
    '日常': { icon: '🐾', color: 'bg-orange-500/80' },
    '编程': { icon: '💻', color: 'bg-purple-500/80' },
    '游戏': { icon: '🎮', color: 'bg-blue-500/80' },
    '宝可梦': { icon: '⚡', color: 'bg-yellow-500/80' },
    '音乐': { icon: '🎵', color: 'bg-green-500/80' }
};

// 初始化博客
async function initBlog() {
    try {
        // 加载文章列表
        const response = await fetch('articles.json');
        if (!response.ok) {
            throw new Error('加载文章列表失败');
        }
        const data = await response.json();
        
        allArticles = data.articles || [];
        filteredArticles = [...allArticles];
        
        // 渲染分类标签
        renderCategories(data.categories || []);
        
        // 渲染第一页文章
        currentPage = 0;
        renderArticles();
        
        // 更新加载更多按钮状态
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('初始化博客失败:', error);
        document.getElementById('blogArticles').innerHTML = `
            <div class="text-center py-12 col-span-full text-gray-500">
                <div class="text-4xl mb-4">😢</div>
                <p>文章加载失败，请刷新页面重试</p>
            </div>
        `;
    }
}

// 渲染分类标签
function renderCategories(categories) {
    const container = document.getElementById('blogCategories');
    let html = '';
    
    // 全部标签
    html += `
        <button onclick="switchCategory('全部')" 
            class="category-btn px-5 py-2 rounded-full ${currentCategory === '全部' ? 'cyber-gradient text-white' : 'glass-card text-gray-300 hover:bg-cyan-500/20 border border-cyan-500/20'} text-sm font-medium street-btn transition">
            全部
        </button>
    `;
    
    // 其他分类
    categories.forEach(cat => {
        const config = categoryConfig[cat] || { icon: '📝', color: 'bg-cyan-500/80' };
        html += `
            <button onclick="switchCategory('${cat}')" 
                class="category-btn px-5 py-2 rounded-full ${currentCategory === cat ? 'cyber-gradient text-white' : 'glass-card text-gray-300 hover:bg-cyan-500/20 border border-cyan-500/20'} text-sm font-medium street-btn transition">
                ${config.icon} ${cat}
            </button>
        `;
    });
    
    container.innerHTML = html;
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    currentPage = 0;
    
    // 筛选文章
    if (category === '全部') {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(a => a.category === category);
    }
    
    // 重新渲染
    renderArticles();
    updateLoadMoreButton();
    
    // 更新分类按钮样式
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.textContent.includes(category) || (category === '全部' && btn.textContent.trim() === '全部')) {
            btn.classList.add('cyber-gradient', 'text-white');
            btn.classList.remove('glass-card', 'text-gray-300', 'hover:bg-cyan-500/20', 'border', 'border-cyan-500/20');
        } else {
            btn.classList.remove('cyber-gradient', 'text-white');
            btn.classList.add('glass-card', 'text-gray-300', 'hover:bg-cyan-500/20', 'border', 'border-cyan-500/20');
        }
    });
}

// 渲染文章列表
function renderArticles() {
    const container = document.getElementById('blogArticles');
    const articlesToShow = filteredArticles.slice(0, (currentPage + 1) * pageSize);
    
    if (articlesToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 col-span-full text-gray-500">
                <div class="text-4xl mb-4">📝</div>
                <p>暂无文章</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    articlesToShow.forEach(article => {
        const config = categoryConfig[article.category] || { icon: '📝', color: 'bg-cyan-500/80' };
        
        // 封面图
        let coverHtml = '';
        if (article.cover) {
            coverHtml = `<img src="${article.cover}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">`;
        } else {
            const bgClass = article.coverBg || 'from-cyan-600 to-blue-800';
            const icon = article.coverIcon || config.icon;
            coverHtml = `
                <div class="w-full h-full bg-gradient-to-br ${bgClass} flex items-center justify-center">
                    <div class="text-6xl">${icon}</div>
                </div>
            `;
        }
        
        html += `
            <article class="glass-card rounded-2xl overflow-hidden card-hover group cursor-pointer" onclick="openArticle(${article.id})">
                <div class="h-48 relative overflow-hidden">
                    ${coverHtml}
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0a1628] to-transparent"></div>
                    <div class="absolute top-4 left-4 px-3 py-1 ${config.color} backdrop-blur rounded-full text-xs font-medium">
                        ${config.icon} ${article.category}
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-center gap-3 text-gray-500 text-xs mb-3">
                        <span>📅 ${article.date}</span>
                        <span>·</span>
                        <span>⏱️ ${article.readTime}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-3 group-hover:text-cyan-400 transition leading-snug">
                        ${article.title}
                    </h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        ${article.summary}
                    </p>
                    <div class="flex items-center justify-end">
                        <span class="text-cyan-400 text-sm hover:text-cyan-300 transition font-medium">
                            阅读 →
                        </span>
                    </div>
                </div>
            </article>
        `;
    });
    
    container.innerHTML = html;
}

// 加载更多文章
function loadMoreArticles() {
    currentPage++;
    renderArticles();
    updateLoadMoreButton();
}

// 更新加载更多按钮状态
function updateLoadMoreButton() {
    const btnContainer = document.getElementById('blogLoadMore');
    const totalShown = (currentPage + 1) * pageSize;
    
    if (totalShown >= filteredArticles.length) {
        btnContainer.style.display = 'none';
    } else {
        btnContainer.style.display = 'block';
    }
}

// ========== 约稿展示系统（动态加载） ==========
// 全局变量
let allGallery = [];            // 所有约稿
let currentGalleryPage = 0;     // 当前页码
const galleryPageSize = 8;      // 每页显示数量
let galleryImageList = [];      // 可放大的图片列表（用于Lightbox）

// 初始化约稿展示
async function initGallery() {
    try {
        // 加载约稿列表
        const response = await fetch('gallery.json');
        if (!response.ok) {
            throw new Error('加载约稿列表失败');
        }
        const data = await response.json();
        
        allGallery = data.artworks || [];
        
        // 构建可放大的图片列表（只包含type为image的）
        galleryImageList = allGallery
            .filter(item => item.type === 'image')
            .map(item => ({
                src: item.image,
                title: item.title,
                desc: item.description
            }));
        
        // 渲染第一页约稿
        currentGalleryPage = 0;
        renderGallery();
        
        // 更新加载更多按钮状态
        updateGalleryLoadMoreButton();
        
    } catch (error) {
        console.error('初始化约稿展示失败:', error);
        document.getElementById('galleryGrid').innerHTML = `
            <div class="text-center py-12 col-span-full text-gray-500">
                <div class="text-4xl mb-4">😢</div>
                <p>约稿加载失败，请刷新页面重试</p>
            </div>
        `;
    }
}

// 渲染约稿列表
function renderGallery() {
    const container = document.getElementById('galleryGrid');
    const itemsToShow = allGallery.slice(0, (currentGalleryPage + 1) * galleryPageSize);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 col-span-full text-gray-500">
                <div class="text-4xl mb-4">🖼️</div>
                <p>暂无约稿</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    itemsToShow.forEach((item, index) => {
        if (item.type === 'image') {
            // 真实图片类型
            // 找到在图片列表中的索引（用于Lightbox）
            const imageIndex = galleryImageList.findIndex(img => img.src === item.image);
            html += `
                <div class="gallery-item aspect-square rounded-2xl overflow-hidden cursor-pointer relative group" onclick="openLightbox(${imageIndex})">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <div>
                            <h4 class="font-bold text-white">${item.title}</h4>
                            <p class="text-cyan-200 text-xs">${item.description}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 占位符类型
            html += `
                <div class="gallery-item aspect-square rounded-2xl overflow-hidden cursor-pointer relative group bg-gradient-to-br ${item.gradient} flex items-center justify-center">
                    <span class="text-5xl">${item.icon}</span>
                    <div class="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <div>
                            <h4 class="font-bold text-white">${item.title}</h4>
                            <p class="text-cyan-200 text-xs">${item.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// 加载更多约稿
function loadMoreGallery() {
    currentGalleryPage++;
    renderGallery();
    updateGalleryLoadMoreButton();
}

// 更新加载更多按钮状态
function updateGalleryLoadMoreButton() {
    const btnContainer = document.getElementById('galleryLoadMore');
    const totalShown = (currentGalleryPage + 1) * galleryPageSize;
    
    if (totalShown >= allGallery.length) {
        btnContainer.style.display = 'none';
    } else {
        btnContainer.style.display = 'block';
    }
}

// ========== 文章详情模态框 ==========
const articleModal = document.getElementById('articleModal');

// 打开文章详情
async function openArticle(id) {
    try {
        // 找到文章元数据
        const articleMeta = allArticles.find(a => a.id === id);
        if (!articleMeta) {
            throw new Error('文章不存在');
        }
        
        // 显示加载状态
        articleModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('articleModalTitle').textContent = '加载中...';
        document.getElementById('articleModalContent').innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5);">文章加载中...</p>';
        
        // 设置头部信息
        renderArticleHeader(articleMeta);
        
        // 加载 MD 文件
        const response = await fetch(articleMeta.path);
        if (!response.ok) {
            throw new Error('加载文章内容失败');
        }
        const markdown = await response.text();
        
        // 用 marked.js 解析 Markdown
        const htmlContent = marked.parse(markdown);
        
        // 设置文章信息
        document.getElementById('articleModalDate').textContent = '📅 ' + articleMeta.date;
        document.getElementById('articleModalReadTime').textContent = '⏱️ ' + articleMeta.readTime;
        document.getElementById('articleModalTitle').textContent = articleMeta.title;
        document.getElementById('articleModalContent').innerHTML = htmlContent;
        
        // 滚动到顶部
        document.querySelector('.article-modal-content').scrollTop = 0;
        
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('articleModalTitle').textContent = '加载失败';
        document.getElementById('articleModalContent').innerHTML = 
            '<p style="text-align:center; color:rgba(255,100,100,0.7);">文章加载失败，请稍后重试</p>';
    }
}

// 渲染文章头部
function renderArticleHeader(article) {
    const modalImg = document.getElementById('articleModalImg');
    const modalBg = document.getElementById('articleModalBg');
    const modalIcon = document.getElementById('articleModalIcon');
    
    if (article.cover) {
        modalImg.src = article.cover;
        modalImg.style.display = 'block';
        modalBg.style.display = 'none';
    } else {
        modalImg.style.display = 'none';
        modalBg.style.display = 'flex';
        
        // 设置渐变背景
        const bgColors = getGradientColors(article.coverBg);
        modalBg.style.background = `linear-gradient(135deg, ${bgColors})`;
        modalIcon.textContent = article.coverIcon || '📝';
    }
}

// 获取渐变颜色
function getGradientColors(bgClass) {
    const colors = {
        'from-cyan-600 to-blue-800': '#0891b2, #1e40af',
        'from-orange-500 to-red-600': '#f97316, #dc2626',
        'from-green-500 to-teal-600': '#22c55e, #0d9488',
        'from-pink-500 to-purple-600': '#ec4899, #9333ea',
        'from-yellow-500 to-amber-600': '#eab308, #d97706',
        'from-blue-500 to-indigo-600': '#3b82f6, #4f46e5'
    };
    return colors[bgClass] || '#00d4ff, #0077b6';
}

function closeArticle() {
    articleModal.classList.remove('active');
    document.body.style.overflow = '';
}

// 点击背景关闭文章
articleModal.addEventListener('click', (e) => {
    if (e.target === articleModal) {
        closeArticle();
    }
});

// ESC关闭文章
document.addEventListener('keydown', (e) => {
    if (articleModal.classList.contains('active') && e.key === 'Escape') {
        closeArticle();
    }
});

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initBlog();
    initGallery();
});
