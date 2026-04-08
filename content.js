// SmartOutline - 智能网页大纲 v2.0
// 优化版本：性能提升、体验增强、功能完善

(function() {
  'use strict';

  // 防止重复注入
  if (window.smartOutlineInitialized) return;
  window.smartOutlineInitialized = true;

  // ==================== 配置项 ====================
  const CONFIG = {
    minHeadingLength: 1,        // 最小标题长度
    scrollOffset: 100,          // 滚动偏移量
    highlightOffset: 150,       // 高亮偏移量
    throttleDelay: 100,         // 节流延迟
    updateDelay: 500,           // 更新延迟
    maxTextLength: 50,          // 最大文本长度
    position: {                 // 默认位置
      right: 20,
      top: 50
    }
  };

  // ==================== 状态管理 ====================
  const state = {
    panelVisible: false,
    headings: [],
    currentActiveIndex: -1,
    button: null,
    panel: null,
    isDragging: false,
    buttonPosition: { ...CONFIG.position },
    observer: null,
    resizeTimer: null
  };

  // ==================== 初始化 ====================
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  function start() {
    try {
      state.headings = getHeadings();

      if (state.headings.length === 0) {
        console.log('[SmartOutline] 页面没有检测到标题');
        return;
      }

      console.log(`[SmartOutline] 检测到 ${state.headings.length} 个标题`);

      // 恢复保存的位置
      loadPosition();

      createFloatingButton();
      bindEvents();
      observePageChanges();

      // 预创建面板（但不显示）
      createPanel();

    } catch (error) {
      console.error('[SmartOutline] 初始化失败:', error);
    }
  }

  // ==================== 获取标题（优化版） ====================
  function getHeadings() {
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const result = [];
    const processedTexts = new Set(); // 去重

    headingElements.forEach((element, index) => {
      // 快速过滤：检查元素是否存在于 DOM
      if (!element.isConnected) return;

      const text = element.textContent.trim();

      // 过滤太短或重复的标题
      if (text.length < CONFIG.minHeadingLength) return;
      if (processedTexts.has(text)) return;

      // 检查是否在导航区域（优化：使用 closest）
      if (isInNavigationFast(element)) return;

      // 延迟检查可见性（性能优化）
      if (!isVisible(element)) return;

      processedTexts.add(text);

      const level = parseInt(element.tagName[1]);
      result.push({
        index: result.length,
        level,
        text: truncateText(text, CONFIG.maxTextLength),
        fullText: text,
        element
      });
    });

    return result;
  }

  // 快速检查是否在导航区域（使用 closest 优化）
  function isInNavigationFast(element) {
    const navSelectors = [
      'nav', 'header', 'aside',
      '[class*="nav"]', '[class*="navbar"]',
      '[class*="sidebar"]', '[class*="menu"]',
      '[class*="navigation"]',
      '[role="navigation"]'
    ];

    for (const selector of navSelectors) {
      if (element.closest(selector)) {
        return true;
      }
    }
    return false;
  }

  // 检查元素可见性（优化版）
  function isVisible(element) {
    // 快速检查：offsetParent 为 null 表示不可见
    if (element.offsetParent === null) return false;

    // 进一步检查样式
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // 截断文本
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // ==================== 创建悬浮球（优化版） ====================
  function createFloatingButton() {
    removeExisting('smart-outline-btn');

    const button = document.createElement('div');
    button.id = 'smart-outline-btn';
    button.className = 'smart-outline-btn';
    button.innerHTML = `
      <span class="smart-outline-icon">☰</span>
      <span class="smart-outline-text">目录</span>
    `;
    button.title = '点击显示大纲 (Alt+O)';

    // 应用保存的位置
    button.style.right = state.buttonPosition.right + 'px';
    button.style.top = state.buttonPosition.top + '%';

    // 添加拖拽功能
    makeDraggable(button);

    document.body.appendChild(button);
    state.button = button;

    // 添加未读标记（如果有新内容）
    updateBadge();
  }

  // 拖拽功能
  function makeDraggable(element) {
    let startX, startY, startRight, startTop;

    element.addEventListener('mousedown', function(e) {
      if (e.target.closest('.smart-outline-btn-content')) return; // 不响应内容区域拖拽

      state.isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = element.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startTop = rect.top;

      element.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!state.isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newRight = Math.max(0, Math.min(window.innerWidth - 60, startRight - deltaX));
      const newTop = Math.max(0, Math.min(window.innerHeight - 60, startTop + deltaY));

      element.style.right = newRight + 'px';
      element.style.top = newTop + 'px';
      element.style.transform = 'none'; // 移除默认的 transform
    });

    document.addEventListener('mouseup', function() {
      if (!state.isDragging) return;

      state.isDragging = false;
      element.style.cursor = 'pointer';

      // 保存位置
      const rect = element.getBoundingClientRect();
      state.buttonPosition = {
        right: window.innerWidth - rect.right,
        top: rect.top
      };
      savePosition();
    });
  }

  // 更新未读标记
  function updateBadge() {
    if (!state.button) return;

    // 可以在这里添加未读计数逻辑
    const badge = state.button.querySelector('.smart-outline-badge');
    if (state.headings.length > 0 && !badge) {
      const newBadge = document.createElement('span');
      newBadge.className = 'smart-outline-badge';
      newBadge.textContent = state.headings.length;
      state.button.appendChild(newBadge);
    }
  }

  // ==================== 创建面板（优化版） ====================
  function createPanel() {
    removeExisting('smart-outline-panel');

    const panel = document.createElement('div');
    panel.id = 'smart-outline-panel';
    panel.style.display = 'none'; // 初始隐藏

    // 头部
    const header = document.createElement('div');
    header.className = 'smart-outline-header';
    header.innerHTML = `
      <div class="smart-outline-title">
        <span class="smart-outline-title-icon">☰</span>
        <span>目录 (${state.headings.length})</span>
      </div>
      <div class="smart-outline-actions">
        <button class="smart-outline-action-btn" id="smart-outline-search-btn" title="搜索">🔍</button>
        <button class="smart-outline-action-btn" id="smart-outline-copy-btn" title="复制大纲">📋</button>
        <button class="smart-outline-action-btn" id="smart-outline-close-btn" title="关闭">✕</button>
      </div>
    `;

    // 搜索框
    const searchBox = document.createElement('div');
    searchBox.className = 'smart-outline-search';
    searchBox.style.display = 'none';
    searchBox.innerHTML = `
      <input type="text" placeholder="搜索标题..." id="smart-outline-search-input">
    `;

    // 列表
    const list = document.createElement('div');
    list.className = 'smart-outline-list';

    if (state.headings.length === 0) {
      list.innerHTML = '<div class="smart-outline-empty">未检测到标题</div>';
    } else {
      const fragment = document.createDocumentFragment();
      state.headings.forEach((heading, index) => {
        const item = createHeadingItem(heading, index);
        fragment.appendChild(item);
      });
      list.appendChild(fragment);
    }

    // 底部工具栏
    const footer = document.createElement('div');
    footer.className = 'smart-outline-footer';
    footer.innerHTML = `
      <span class="smart-outline-hint">Alt+O 快捷键</span>
      <span class="smart-outline-hint">ESC 关闭</span>
    `;

    panel.appendChild(header);
    panel.appendChild(searchBox);
    panel.appendChild(list);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    state.panel = panel;

    // 绑定面板内事件
    bindPanelEvents(searchBox, list);
  }

  // 创建大纲项
  function createHeadingItem(heading, index) {
    const item = document.createElement('div');
    item.className = `smart-outline-item level-${heading.level}`;
    item.dataset.index = index;
    item.dataset.level = heading.level;
    item.title = heading.fullText;
    item.innerHTML = `
      <span class="smart-outline-bullet">${'•'.repeat(heading.level)}</span>
      <span class="smart-outline-item-text">${escapeHtml(heading.text)}</span>
    `;

    item.addEventListener('click', () => {
      scrollToHeading(heading.element);
      highlightItem(index);
    });

    return item;
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    if (!state.button) return;

    state.button.addEventListener('click', function(e) {
      if (state.isDragging) return; // 拖拽时不触发点击
      togglePanel();
    });

    // 键盘快捷键
    document.addEventListener('keydown', handleKeyDown);

    // 窗口大小改变
    window.addEventListener('resize', throttle(() => {
      if (state.panelVisible) {
        updatePanelPosition();
      }
    }, 200));

    // 滚动监听（节流）
    window.addEventListener('scroll', throttle(updateActiveHeading, CONFIG.throttleDelay));
  }

  function bindPanelEvents(searchBox, list) {
    const searchBtn = document.getElementById('smart-outline-search-btn');
    const searchInput = document.getElementById('smart-outline-search-input');
    const copyBtn = document.getElementById('smart-outline-copy-btn');
    const closeBtn = document.getElementById('smart-outline-close-btn');

    // 搜索功能
    searchBtn?.addEventListener('click', () => {
      const isVisible = searchBox.style.display !== 'none';
      searchBox.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) searchInput?.focus();
    });

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filterHeadings(query);
    });

    // 复制大纲
    copyBtn?.addEventListener('click', copyOutline);

    // 关闭面板
    closeBtn?.addEventListener('click', closePanel);

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (state.panelVisible &&
          !state.panel?.contains(e.target) &&
          !state.button?.contains(e.target)) {
        closePanel();
      }
    });
  }

  function handleKeyDown(e) {
    // Alt + O 切换面板
    if (e.altKey && (e.key === 'o' || e.key === 'O')) {
      e.preventDefault();
      togglePanel();
      return;
    }

    // ESC 关闭面板
    if (e.key === 'Escape' && state.panelVisible) {
      closePanel();
      return;
    }

    // 面板打开时的快捷键
    if (state.panelVisible) {
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigateHeading(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateHeading(-1);
          break;
        case 'Enter':
          e.preventDefault();
          activateCurrentHeading();
          break;
      }
    }
  }

  // 导航大纲项
  function navigateHeading(direction) {
    const items = state.panel?.querySelectorAll('.smart-outline-item');
    if (!items || items.length === 0) return;

    let newIndex = state.currentActiveIndex + direction;
    newIndex = Math.max(0, Math.min(items.length - 1, newIndex));

    highlightItem(newIndex);
    items[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 激活当前高亮项
  function activateCurrentHeading() {
    const items = state.panel?.querySelectorAll('.smart-outline-item');
    if (!items || items.length === 0) return;

    const currentItem = items[state.currentActiveIndex];
    if (currentItem) {
      currentItem.click();
    }
  }

  // ==================== 面板控制 ====================
  function togglePanel() {
    if (state.panelVisible) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    if (!state.panel) createPanel();

    state.panel.style.display = 'block';
    state.panelVisible = true;

    // 添加动画效果
    requestAnimationFrame(() => {
      state.panel?.classList.add('smart-outline-panel-visible');
    });

    updateActiveHeading();
  }

  function closePanel() {
    if (!state.panel) return;

    state.panel.classList.remove('smart-outline-panel-visible');

    // 延迟隐藏以完成动画
    setTimeout(() => {
      state.panel.style.display = 'none';
      state.panelVisible = false;
    }, 200);
  }

  function updatePanelPosition() {
    // 确保面板在可视区域内
    if (!state.panel) return;

    const rect = state.panel.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      state.panel.style.right = '20px';
    }
    if (rect.bottom > window.innerHeight) {
      state.panel.style.maxHeight = (window.innerHeight - 100) + 'px';
    }
  }

  // ==================== 搜索功能 ====================
  function filterHeadings(query) {
    const items = state.panel?.querySelectorAll('.smart-outline-item');
    if (!items) return;

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const match = text.includes(query);
      item.style.display = match ? '' : 'none';
      item.classList.toggle('smart-outline-filtered', !match);
    });
  }

  // ==================== 复制大纲 ====================
  async function copyOutline() {
    const outline = state.headings.map(h => {
      const indent = '  '.repeat(h.level - 1);
      return `${indent}- ${h.fullText}`;
    }).join('\n');

    try {
      await navigator.clipboard.writeText(outline);
      showToast('大纲已复制到剪贴板');
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = outline;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('大纲已复制到剪贴板');
    }
  }

  // Toast 提示
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'smart-outline-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ==================== 滚动与高亮 ====================
  function scrollToHeading(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset + rect.top - CONFIG.scrollOffset;

    window.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
  }

  function updateActiveHeading() {
    if (!state.panelVisible || state.headings.length === 0) return;

    const scrollTop = window.pageYOffset;
    let activeIndex = -1;

    // 找到当前阅读位置
    for (let i = 0; i < state.headings.length; i++) {
      const element = state.headings[i].element;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;

      if (elementTop <= scrollTop + CONFIG.highlightOffset) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex === -1 && state.headings.length > 0) {
      activeIndex = 0;
    }

    if (activeIndex !== state.currentActiveIndex) {
      state.currentActiveIndex = activeIndex;
      highlightItem(activeIndex);
    }
  }

  function highlightItem(index) {
    const items = state.panel?.querySelectorAll('.smart-outline-item');
    if (!items) return;

    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        // 只在必要时滚动
        const rect = item.getBoundingClientRect();
        const panelRect = state.panel.getBoundingClientRect();
        if (rect.top < panelRect.top || rect.bottom > panelRect.bottom) {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ==================== 页面变化监听（优化版） ====================
  function observePageChanges() {
    if (state.observer) return;

    state.observer = new MutationObserver(throttle((mutations) => {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;

        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // 检查是否是标题或包含标题
          if (node.matches?.('h1, h2, h3, h4, h5, h6')) {
            shouldUpdate = true;
            break;
          }
          if (node.querySelectorAll?.('h1, h2, h3, h4, h5, h6').length > 0) {
            shouldUpdate = true;
            break;
          }
        }

        if (shouldUpdate) break;
      }

      if (shouldUpdate) {
        updateHeadings();
      }
    }, CONFIG.updateDelay));

    state.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function updateHeadings() {
    const newHeadings = getHeadings();

    if (newHeadings.length !== state.headings.length) {
      state.headings = newHeadings;
      updateBadge();

      if (state.panelVisible) {
        createPanel(); // 重建面板
      }
    }
  }

  // ==================== 工具函数 ====================
  function removeExisting(id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  }

  function throttle(fn, delay) {
    let timer = null;
    return function(...args) {
      if (timer) return;
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  }

  // ==================== 本地存储 ====================
  function savePosition() {
    try {
      localStorage.setItem('smart-outline-position', JSON.stringify(state.buttonPosition));
    } catch (e) {
      // 忽略存储错误
    }
  }

  function loadPosition() {
    try {
      const saved = localStorage.getItem('smart-outline-position');
      if (saved) {
        state.buttonPosition = JSON.parse(saved);
      }
    } catch (e) {
      // 使用默认位置
    }
  }

  // ==================== 启动 ====================
  init();

})();
