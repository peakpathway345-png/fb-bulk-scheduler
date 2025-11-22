let uploadCounter = 0;
let selectedPages = [];

// Check authentication on load
checkAuth();

function checkAuth() {
    axios.get('/auth/status')
        .then(res => {
            if (!res.data.authenticated) {
                window.location.href = '/';
            } else {
                document.getElementById('userName').textContent = res.data.user.name;
                document.getElementById('userPhoto').src = res.data.user.profile_picture || 'https://via.placeholder.com/40';
                loadPages();
                loadScheduledPosts();
                loadStats();
                // Add first upload form
                addUploadForm();
                // Refresh data every 30 seconds
                setInterval(() => {
                    loadScheduledPosts();
                    loadStats();
                }, 30000);
            }
        })
        .catch(err => {
            console.error('Auth check failed:', err);
            window.location.href = '/';
        });
}

function fetchPages() {
    document.getElementById('pagesList').innerHTML = '<p class="text-gray-500 text-center py-4">Fetching pages from Facebook...</p>';
    
    axios.get('/api/pages/fetch')
        .then(res => {
            alert('✅ Pages fetched successfully!');
            loadPages();
        })
        .catch(err => {
            alert('❌ Failed to fetch pages: ' + (err.response?.data?.error || err.message));
            loadPages();
        });
}

function loadPages() {
    axios.get('/api/pages/list')
        .then(res => {
            const pages = res.data.pages;
            const container = document.getElementById('pagesList');
            
            if (pages.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-exclamation-circle text-4xl text-yellow-500 mb-3"></i>
                        <p class="text-gray-600 mb-4">No pages found. Click "Refresh Pages" to fetch your Facebook pages.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = pages.map(page => `
                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div class="flex items-center">
                        <input type="checkbox" 
                               id="page-${page.id}" 
                               value="${page.id}" 
                               ${page.is_active ? 'checked' : ''}
                               onchange="togglePage(${page.id}, this.checked)"
                               class="w-5 h-5 text-blue-600 rounded mr-3">
                        <label for="page-${page.id}" class="cursor-pointer">
                            <p class="font-semibold text-gray-800">${page.page_name}</p>
                            <p class="text-xs text-gray-500">${page.category || 'No category'}</p>
                        </label>
                    </div>
                    <span class="px-3 py-1 text-xs rounded-full ${page.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                        ${page.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            `).join('');

            // Update selected pages
            selectedPages = pages.filter(p => p.is_active).map(p => p.id);
        })
        .catch(err => {
            console.error('Failed to load pages:', err);
        });
}

function togglePage(pageId, isActive) {
    axios.post(`/api/pages/toggle/${pageId}`, { isActive })
        .then(res => {
            if (isActive) {
                selectedPages.push(pageId);
            } else {
                selectedPages = selectedPages.filter(id => id !== pageId);
            }
        })
        .catch(err => {
            alert('Failed to update page: ' + err.message);
        });
}

function addUploadForm() {
    uploadCounter++;
    const container = document.getElementById('uploadForms');
    
    const formHtml = `
        <div id="upload-${uploadCounter}" class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-gray-700">Post #${uploadCounter}</h3>
                <button onclick="removeUploadForm(${uploadCounter})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <i class="fas fa-image mr-1"></i> Photo/Video
                    </label>
                    <input type="file" 
                           id="file-${uploadCounter}" 
                           accept="image/*,video/*" 
                           required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <i class="fas fa-align-left mr-1"></i> Caption
                    </label>
                    <textarea id="caption-${uploadCounter}" 
                              rows="3" 
                              placeholder="Post caption..."
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        <i class="fas fa-clock mr-1"></i> Schedule Time
                    </label>
                    <input type="datetime-local" 
                           id="schedule-${uploadCounter}" 
                           required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', formHtml);
}

function removeUploadForm(id) {
    const element = document.getElementById(`upload-${id}`);
    if (element) {
        element.remove();
    }
}

async function submitBulkUpload() {
    if (selectedPages.length === 0) {
        alert('⚠️ Please select at least one Facebook page!');
        return;
    }

    const forms = document.querySelectorAll('[id^="upload-"]');
    if (forms.length === 0) {
        alert('⚠️ Please add at least one post!');
        return;
    }

    const formData = new FormData();
    const posts = [];

    // Collect all posts data
    for (const form of forms) {
        const id = form.id.split('-')[1];
        const fileInput = document.getElementById(`file-${id}`);
        const caption = document.getElementById(`caption-${id}`).value;
        const scheduleTime = document.getElementById(`schedule-${id}`).value;

        if (!fileInput.files[0]) {
            alert(`⚠️ Please select a file for Post #${id}`);
            return;
        }

        if (!scheduleTime) {
            alert(`⚠️ Please set schedule time for Post #${id}`);
            return;
        }

        formData.append('media', fileInput.files[0]);
        posts.push({
            caption,
            schedule_time: scheduleTime,
            page_ids: selectedPages
        });
    }

    formData.append('posts', JSON.stringify(posts));

    // Show loading
    const submitBtn = event.target;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Uploading...';
    submitBtn.disabled = true;

    try {
        const res = await axios.post('/api/posts/bulk-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert(`✅ ${res.data.message}`);
        
        // Clear forms
        document.getElementById('uploadForms').innerHTML = '';
        uploadCounter = 0;
        addUploadForm();
        
        // Reload data
        loadScheduledPosts();
        loadStats();
    } catch (err) {
        alert('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function loadScheduledPosts() {
    axios.get('/api/posts/scheduled')
        .then(res => {
            const posts = res.data.posts;
            const container = document.getElementById('scheduledPosts');

            if (posts.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">No scheduled posts yet</p>';
                return;
            }

            container.innerHTML = posts.map(post => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-800',
                    'published': 'bg-green-100 text-green-800',
                    'failed': 'bg-red-100 text-red-800'
                };

                const scheduleDate = new Date(post.schedule_time);
                
                return `
                    <div class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-2">
                            <span class="px-2 py-1 text-xs rounded-full ${statusColors[post.status]}">
                                ${post.status.toUpperCase()}
                            </span>
                            ${post.status === 'pending' ? `
                                <button onclick="deletePost(${post.id})" class="text-red-500 hover:text-red-700 text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        <p class="text-sm font-semibold text-gray-800 mb-1">${post.page_name}</p>
                        <p class="text-xs text-gray-600 mb-2 line-clamp-2">${post.caption || 'No caption'}</p>
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            ${scheduleDate.toLocaleString('hi-IN')}
                        </p>
                        ${post.status === 'published' && post.facebook_post_id ? `
                            <a href="https://facebook.com/${post.facebook_post_id}" 
                               target="_blank" 
                               class="text-xs text-blue-600 hover:underline mt-2 inline-block">
                                <i class="fas fa-external-link-alt mr-1"></i> View on Facebook
                            </a>
                        ` : ''}
                    </div>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('Failed to load scheduled posts:', err);
        });
}

function loadStats() {
    axios.get('/api/posts/stats')
        .then(res => {
            document.getElementById('statPending').textContent = res.data.pending || 0;
            document.getElementById('statPublished').textContent = res.data.published || 0;
            document.getElementById('statFailed').textContent = res.data.failed || 0;
            document.getElementById('statTotal').textContent = res.data.total || 0;
        })
        .catch(err => {
            console.error('Failed to load stats:', err);
        });
}

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this scheduled post?')) {
        return;
    }

    axios.delete(`/api/posts/${postId}`)
        .then(res => {
            alert('✅ Post deleted successfully');
            loadScheduledPosts();
            loadStats();
        })
        .catch(err => {
            alert('❌ Failed to delete post: ' + err.message);
        });
}
