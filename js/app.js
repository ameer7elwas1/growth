class AuthSystem {
      constructor() {
        this.currentUser = null;
        this.permissions = {
          admin: ['view', 'add', 'edit', 'delete', 'manage_users', 'export', 'reports'],
          supervisor: ['view', 'add', 'edit', 'export', 'reports'],
          viewer: ['view', 'export']
        };
        this.init();
      }

      init() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
          const session = localStorage.getItem('userSession');
          if (!session) {
            overlay.style.display = 'flex';
            overlay.style.pointerEvents = 'auto';
          } else {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
          }
        }
        
        this.loadCurrentUser();
        this.checkAuthentication();
        this.setupEventListeners();
        this.ensureInputsEditable();
      }
        
      ensureInputsEditable() {
        setTimeout(() => {
          const usernameInput = document.getElementById('authUsername');
          const passwordInput = document.getElementById('authPassword');
          
          if (usernameInput) {
            usernameInput.disabled = false;
            usernameInput.readOnly = false;
            usernameInput.removeAttribute('disabled');
            usernameInput.removeAttribute('readonly');
            usernameInput.style.pointerEvents = 'auto';
            usernameInput.style.userSelect = 'text';
            usernameInput.style.cursor = 'text';
            usernameInput.style.opacity = '1';
            usernameInput.style.zIndex = '10003';
          }
          
          if (passwordInput) {
            passwordInput.disabled = false;
            passwordInput.readOnly = false;
            passwordInput.removeAttribute('disabled');
            passwordInput.removeAttribute('readonly');
            passwordInput.style.pointerEvents = 'auto';
            passwordInput.style.userSelect = 'text';
            passwordInput.style.cursor = 'text';
            passwordInput.style.opacity = '1';
            passwordInput.style.zIndex = '10003';
          }
        }, 100);
      }

      loadCurrentUser() {
        const session = localStorage.getItem('userSession');
        if (session) {
          try {
            this.currentUser = JSON.parse(session);
            const loginTime = new Date(this.currentUser.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff >= 24) {
              this.logout();
              return;
            }
            this.hideAuthOverlay();
            this.updateUI();
          } catch (error) {
            this.logout();
          }
        }
      }

      checkAuthentication() {
        if (!this.currentUser) {
          this.showAuthOverlay();
          return false;
        }
        return true;
      }

      hasPermission(permission) {
        if (!this.currentUser) {
          return false;
        }
        const result = this.permissions[this.currentUser.role]?.includes(permission) || false;
        return result;
      }

      canView() { return this.hasPermission('view'); }
      canAdd() { return this.hasPermission('add'); }
      canEdit() { 
        const result = this.hasPermission('edit');
        return result;
      }
      canDelete() { return this.hasPermission('delete'); }
      canManageUsers() { return this.hasPermission('manage_users'); }
      canExport() { return this.hasPermission('export'); }
      canGenerateReports() { return this.hasPermission('reports'); }

      getCurrentUser() { return this.currentUser; }
      getUserRole() { return this.currentUser?.role || 'viewer'; }
      getUserName() { return this.currentUser?.name || 'ظ…ط³طھط®ط¯ظ…'; }

      getRoleName(role) {
        const roles = {
          'admin': 'ظ…ط¯ظٹط±',
          'supervisor': 'ظ…ط´ط±ظپ',
          'viewer': 'ظ…ط´ط§ظ‡ط¯'
        };
        return roles[role] || role;
      }

      showAuthOverlay() {
        const overlay = document.getElementById('authOverlay');
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        document.querySelector('.container').style.display = 'none';
        
        setTimeout(() => {
          this.ensureInputsEditable();
        }, 50);
      }

      hideAuthOverlay() {
        const overlay = document.getElementById('authOverlay');
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        const container = document.querySelector('.container');
        if (container) {
          container.style.display = 'block';
        }
      }

      showError(message) {
        const errorEl = document.getElementById('authError');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        document.getElementById('authSuccess').style.display = 'none';
      }

      showSuccess(message) {
        const successEl = document.getElementById('authSuccess');
        successEl.textContent = message;
        successEl.style.display = 'block';
        document.getElementById('authError').style.display = 'none';
      }

      hideMessages() {
        document.getElementById('authError').style.display = 'none';
        document.getElementById('authSuccess').style.display = 'none';
      }

      showLoading() {
        document.getElementById('authLoading').style.display = 'block';
        document.getElementById('authLoginBtn').disabled = true;
        document.getElementById('authLoginBtn').textContent = 'ط¬ط§ط±ظٹ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„...';
      }

      hideLoading() {
        document.getElementById('authLoading').style.display = 'none';
        document.getElementById('authLoginBtn').disabled = false;
        document.getElementById('authLoginBtn').textContent = 'طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„';
      }

      async validateUser(username, password) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('username', username)
              .eq('password_hash', password)
              .eq('status', 'active')
              .single();

            if (error) {
              return this.validateUserFromLocalStorage(username, password);
            }

            if (data) {
              return {
                success: true,
                user: {
                  id: data.id,
                  username: data.username,
                  role: data.role,
                  name: data.full_name || data.username
                }
              };
            }
          }

          return this.validateUserFromLocalStorage(username, password);
        } catch (error) {
          return this.validateUserFromLocalStorage(username, password);
        }
      }

      validateUserFromLocalStorage(username, password) {
        try {
          const savedUsers = localStorage.getItem('systemUsers');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            const user = users.find(u => 
              u.username === username && 
              u.password_hash === password && 
              u.status === 'active'
            );
            
            if (user) {
              return {
                success: true,
                user: {
                  id: user.id,
                  username: user.username,
                  role: user.role,
                  name: user.full_name || user.username
                }
              };
            }
          }

          

          const user = demoUsers[username];
          if (user && user.password === password) {
            return {
              success: true,
              user: {
                id: username,
                username: username,
                role: user.role,
                name: user.name
              }
            };
          }

          return { success: false, message: 'ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ط£ظˆ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± طµط­ظٹط­ط©' };
        } catch (error) {
          return { success: false, message: 'ط®ط·ط£ ظپظٹ ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط³طھط®ط¯ظ…' };
        }
      }

      saveUserSession(user) {
        const session = {
          username: user.username,
          role: user.role,
          name: user.name,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('userSession', JSON.stringify(session));
      }

      updateUI() {
        if (!this.currentUser) {
          
          return;
        }

        

        document.getElementById('userName').textContent = this.getUserName();
        document.getElementById('userRole').textContent = this.getRoleName(this.getUserRole());
        document.getElementById('userAvatar').textContent = this.getUserName().charAt(0);
        document.getElementById('userInfo').style.display = 'flex';

        this.updateElementVisibility();
        
        this.updateTableActionButtons();
      }

      updateTableActionButtons() {
        const canEdit = this.canEdit();
        const canDelete = this.canDelete();
        
        
        
        const editButtons = document.querySelectorAll('button[data-action="edit"]');
        const editInfoButtons = document.querySelectorAll('button[data-action="edit-info"]');
        const deleteButtons = document.querySelectorAll('button[data-action="delete"]');
        
        
        
        editButtons.forEach(btn => {
          btn.style.display = canEdit ? 'inline-flex' : 'none';
          
        });
        
        editInfoButtons.forEach(btn => {
          btn.style.display = canEdit ? 'inline-flex' : 'none';
          
        });
        
        deleteButtons.forEach(btn => {
          btn.style.display = canDelete ? 'inline-flex' : 'none';
          
        });
      }

      updateElementVisibility() {
        const addButton = document.getElementById('btnAddAgent');
        if (addButton) {
          addButton.style.display = this.canAdd() ? 'inline-flex' : 'none';
        }

        const exportButton = document.getElementById('btnWeeklyReport');
        if (exportButton) {
          exportButton.style.display = this.canExport() ? 'inline-flex' : 'none';
        }

        const userMgmtButton = document.getElementById('btnUserManagement');
        if (userMgmtButton) {
          userMgmtButton.style.display = this.canManageUsers() ? 'inline-flex' : 'none';
        }

        if (this.getUserRole() === 'viewer') {
          const inputs = document.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            input.disabled = true;
          });
        }
      }

      setupEventListeners() {
        document.getElementById('authForm').addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleLogin();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
          this.logout();
        });

        document.getElementById('btnUserManagement').addEventListener('click', () => {
          window.open('user_management_database.html', '_blank');
        });

        const usernameInput = document.getElementById('authUsername');
        const passwordInput = document.getElementById('authPassword');
        
        if (usernameInput) {
          usernameInput.addEventListener('focus', () => {
            usernameInput.style.pointerEvents = 'auto';
            usernameInput.style.userSelect = 'text';
          });
          
          usernameInput.addEventListener('click', () => {
            usernameInput.focus();
          });
        }
        
        if (passwordInput) {
          passwordInput.addEventListener('focus', () => {
            passwordInput.style.pointerEvents = 'auto';
            passwordInput.style.userSelect = 'text';
          });
          
          passwordInput.addEventListener('click', () => {
            passwordInput.focus();
          });
        }
      }

      async handleLogin() {
        this.hideMessages();

        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;

        if (!username || !password) {
          this.showError('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ظˆظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±');
          return;
        }

        this.showLoading();

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const validation = await this.validateUser(username, password);
          
          
          if (validation.success) {
            this.currentUser = validation.user;
            
            this.saveUserSession(validation.user);
            
            this.showSuccess(`ظ…ط±ط­ط¨ط§ظ‹ ${validation.user.name}! طھظ… طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط¨ظ†ط¬ط§ط­`);
            
            setTimeout(() => {
              this.hideAuthOverlay();
              this.updateUI();
            }, 1500);
          } else {
            this.hideLoading();
            this.showError(validation.message);
          }
        } catch (error) {
          this.hideLoading();
          this.showError('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„. ظٹط±ط¬ظ‰ ط§ظ„ظ…ط­ط§ظˆظ„ط© ظ…ط±ط© ط£ط®ط±ظ‰');
        }
      }

      logout() {
        this.currentUser = null;
        localStorage.removeItem('userSession');
        this.showAuthOverlay();
        document.getElementById('authForm').reset();
        this.hideMessages();
        if (window.stopInactivityTimer) {
          window.stopInactivityTimer();
        }
      }
    }

    const authSystem = new AuthSystem();
    
    function forceEnableLoginInputs() {
      const usernameInput = document.getElementById('authUsername');
      const passwordInput = document.getElementById('authPassword');
      
      if (usernameInput) {
        usernameInput.disabled = false;
        usernameInput.readOnly = false;
        usernameInput.removeAttribute('disabled');
        usernameInput.removeAttribute('readonly');
        usernameInput.style.pointerEvents = 'auto';
        usernameInput.style.userSelect = 'text';
        usernameInput.style.cursor = 'text';
        usernameInput.style.opacity = '1';
        usernameInput.style.zIndex = '10003';
        usernameInput.tabIndex = 0;
      }
      
      if (passwordInput) {
        passwordInput.disabled = false;
        passwordInput.readOnly = false;
        passwordInput.removeAttribute('disabled');
        passwordInput.removeAttribute('readonly');
        passwordInput.style.pointerEvents = 'auto';
        passwordInput.style.userSelect = 'text';
        passwordInput.style.cursor = 'text';
        passwordInput.style.opacity = '1';
        passwordInput.style.zIndex = '10003';
        passwordInput.tabIndex = 0;
      }
    }
    
    forceEnableLoginInputs();
    setTimeout(forceEnableLoginInputs, 100);
    setTimeout(forceEnableLoginInputs, 500);
    setTimeout(forceEnableLoginInputs, 1000);
    
    document.addEventListener('DOMContentLoaded', forceEnableLoginInputs);
    window.addEventListener('load', forceEnableLoginInputs);
    
    const overlayObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const overlay = document.getElementById('authOverlay');
          if (overlay && overlay.style.display === 'flex') {
            setTimeout(forceEnableLoginInputs, 50);
            setTimeout(forceEnableLoginInputs, 200);
          }
        }
      });
    });
    
    const authOverlayElement = document.getElementById('authOverlay');
    if (authOverlayElement) {
      overlayObserver.observe(authOverlayElement, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    
    document.addEventListener('click', function(e) {
      if (e.target.id === 'authUsername' || e.target.id === 'authPassword') {
        forceEnableLoginInputs();
        e.target.focus();
      }
    }, true);
    
    document.addEventListener('mousedown', function(e) {
      if (e.target.id === 'authUsername' || e.target.id === 'authPassword') {
        forceEnableLoginInputs();
      }
    }, true);
    
    (function() {
      const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
      let inactivityTimer = null;
      
      function resetInactivityTimer(event) {
        if (event && event.target) {
          const target = event.target;
          if (target && (
            target.id === 'authUsername' || 
            target.id === 'authPassword' || 
            (target.closest && target.closest('#authOverlay')) || 
            (target.closest && target.closest('.auth-container'))
          )) {
            if (!authSystem.getCurrentUser()) {
              return;
            }
          }
        }
        
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        
        if (!authSystem.getCurrentUser()) {
          return;
        }
        
        inactivityTimer = setTimeout(() => {
          if (authSystem.getCurrentUser()) {
            authSystem.logout();
          }
        }, INACTIVITY_TIMEOUT);
      }
      
      function stopInactivityTimer() {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
          inactivityTimer = null;
        }
      }
      
      const activityEvents = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click'
      ];
      
      activityEvents.forEach(event => {
        document.addEventListener(event, function(e) {
          if (e.target && (
            e.target.id === 'authUsername' || 
            e.target.id === 'authPassword' ||
            (e.target.closest && e.target.closest('#authOverlay')) ||
            (e.target.closest && e.target.closest('.auth-container'))
          )) {
            if (!authSystem.getCurrentUser()) {
              return;
            }
          }
          resetInactivityTimer(e);
        }, true);
      });
      
      setTimeout(() => {
        if (authSystem.getCurrentUser()) {
          resetInactivityTimer();
        }
      }, 500);
      
      const originalHideAuthOverlay = authSystem.hideAuthOverlay.bind(authSystem);
      authSystem.hideAuthOverlay = function() {
        originalHideAuthOverlay();
        resetInactivityTimer();
      };
      
      const originalLogout = authSystem.logout.bind(authSystem);
      authSystem.logout = function() {
        stopInactivityTimer();
        originalLogout();
      };
      
      window.resetInactivityTimer = resetInactivityTimer;
      window.stopInactivityTimer = stopInactivityTimer;
      
      window.addEventListener('focus', () => {
        if (authSystem.getCurrentUser()) {
          resetInactivityTimer();
        }
      });
      
    })();
    
    function positionModal(modalElement) {
      if (!modalElement) return;
      
      modalElement.style.top = '0';
      modalElement.style.left = '0';
      modalElement.style.width = '100vw';
      modalElement.style.height = '100vh';
      modalElement.style.display = 'flex';
      modalElement.style.alignItems = 'center';
      modalElement.style.justifyContent = 'center';
      modalElement.style.padding = '20px';
      
      const modalBox = modalElement.querySelector('.box');
      if (modalBox) {
        modalBox.style.margin = 'auto';
        modalBox.style.position = 'relative';
        modalBox.style.top = 'auto';
        modalBox.style.left = 'auto';
        modalBox.style.transform = 'none';
      }
    }
    
    function closeModal(modalElement) {
      if (!modalElement) return;
      modalElement.classList.remove('open');
      modalElement.style.display = 'none';
      modalElement.style.top = '0';
      modalElement.style.left = '0';
      modalElement.style.width = '100vw';
      modalElement.style.height = '100vh';
      modalElement.style.padding = '20px';
    }
    
    
    window.addEventListener('resize', function() {
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => {
        positionModal(modal);
      });
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.open');
        openModals.forEach(modal => {
          closeModal(modal);
        });
      }
    });

    const SUPABASE_URL = (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.URL) ? SUPABASE_CONFIG.URL : 'https://vpvvjascwgivdjyyhzwp.supabase.co';
    const SUPABASE_ANON_KEY = (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.ANON_KEY) ? SUPABASE_CONFIG.ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdnZqYXNjd2dpdmRqeXloendwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDYxMjYsImV4cCI6MjA2NTM4MjEyNn0.6AR2-MG4x9ugNTXe9jUqx-IwGEtj1m6MCYwQkTsSbUQ';
    
    const SupabaseManager = {
      _instance: null,
      _isInitialized: false,
      connectionStatus: 'disconnected',
      _creationAttempts: 0,
      _maxAttempts: 3,
      
      getInstance() {
        if (this._instance) {
          return this._instance;
        }
        
        if (this._creationAttempts >= this._maxAttempts) {
          return null;
        }
        
        if (!this._isInitialized) {
          this._isInitialized = true;
          this._creationAttempts++;
          
          try {
            this._instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
              }
            });
            
          } catch (e) {
            this._isInitialized = false;
            return null;
          }
        }
        return this._instance;
      },
      
      reset() {
        
        this.connectionStatus = 'disconnected';
        this._creationAttempts = 0;
        this._isInitialized = false;
      },
      
      isConnected() {
        return this._instance !== null && this.connectionStatus === 'connected';
      },
      
      hasInstance() {
        return this._instance !== null;
      }
    };
    
    function getSupabaseClient() {
      return SupabaseManager.getInstance();
    }
    
    function reinitializeSupabase() {
      try {
        
        
        if (SupabaseManager.hasInstance()) {
          
          SupabaseManager.connectionStatus = 'disconnected';
          return true;
        }
        
        SupabaseManager.reset();
        const client = getSupabaseClient();
        if (client) {
          
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
   
    const STORAGE_KEY = 'agents_dashboard_data_v1';

    window.toggleUserContactPopup = function(event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      const popup = document.getElementById('userContactPopup');
      const sidebarUser = document.getElementById('sidebarUser');
      if (!popup || !sidebarUser) {
        return false;
      }
      
      const isShowing = popup.classList.contains('show');
      if (isShowing) {
        popup.style.animation = 'popupFadeOut 0.15s ease-out forwards';
        setTimeout(() => {
          popup.classList.remove('show');
          popup.style.display = 'none';
          popup.style.opacity = '0';
          popup.style.visibility = 'hidden';
          popup.style.pointerEvents = 'none';
          popup.style.animation = '';
          popup.style.transform = '';
          if (sidebarUser) {
            sidebarUser.style.transform = 'scale(1)';
            sidebarUser.style.boxShadow = '0 4px 12px rgba(128, 28, 50, 0.4)';
          }
        }, 150);
      } else {
        const allPopups = document.querySelectorAll('.user-contact-popup.show');
        allPopups.forEach(p => {
          p.classList.remove('show');
          p.style.display = 'none';
          p.style.opacity = '0';
          p.style.visibility = 'hidden';
          p.style.pointerEvents = 'none';
          p.style.animation = '';
          p.style.transform = '';
        });
        
        const rect = sidebarUser.getBoundingClientRect();
        const popupWidth = 280;
        const popupHeight = 220;
        
        let left = rect.left - popupWidth - 15;
        let top = rect.top;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (left < 10) {
          left = rect.right + 15;
        }
        if (left + popupWidth > windowWidth - 10) {
          left = windowWidth - popupWidth - 10;
        }
        if (top + popupHeight > windowHeight - 10) {
          top = windowHeight - popupHeight - 10;
        }
        if (top < 10) {
          top = 10;
        }
        
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
        popup.style.display = 'block';
        popup.style.visibility = 'visible';
        popup.style.pointerEvents = 'auto';
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(-5px)';
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            popup.classList.add('show');
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
          }, 10);
        });
      }
      return false;
    };
    
    document.addEventListener('click', (e) => {
      const popup = document.getElementById('userContactPopup');
      const sidebarUser = document.getElementById('sidebarUser');
      if (popup && sidebarUser && popup.classList.contains('show')) {
        if (!popup.contains(e.target) && !sidebarUser.contains(e.target)) {
          toggleUserContactPopup();
        }
      }
    });

    function updateConnectionStatus(status) {
      const statusEl = document.getElementById('connectionStatus');
      const iconEl = document.getElementById('statusIcon');
      const textEl = document.getElementById('statusText');
      
      if (!statusEl || !iconEl || !textEl) return;
      
    
      statusEl.className = '';
      
      switch(status) {
        case 'connected':
          statusEl.classList.add('connected');
          iconEl.textContent = 'âœ“';
          textEl.textContent = 'ظ…طھطµظ„';
          break;
        case 'error':
          statusEl.classList.add('error');
          iconEl.textContent = '💾';
          textEl.textContent = 'وضع محلي فقط';
          break;
        case 'connecting':
          statusEl.classList.add('connecting');
          iconEl.textContent = 'ًں”„';
          textEl.textContent = 'ط¬ط§ط±ظٹ ط§ظ„ط§طھطµط§ظ„...';
          break;
        default:
          statusEl.classList.add('connecting');
          iconEl.textContent = 'ًں”„';
          textEl.textContent = 'ط¬ط§ط±ظٹ ط§ظ„ط§طھطµط§ظ„...';
      }
    }


    function validateAgentData(agent) {
      const errors = [];
      
      if (!agent.name || agent.name.trim() === '') {
        errors.push('ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„ ظ…ط·ظ„ظˆط¨');
      }
      
      if (!agent.contract_date) {
        errors.push('طھط§ط±ظٹط® ط§ظ„ط¹ظ‚ط¯ ظ…ط·ظ„ظˆط¨');
      }
      
      if (!agent.phase || !['PHASE1', 'PHASE2', 'PHASE3', 'OLD'].includes(agent.phase)) {
        errors.push('ط§ظ„ظ…ط±ط­ظ„ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† PHASE1, PHASE2, PHASE3, ط£ظˆ OLD');
      }
      
      if (typeof agent.total_users !== 'number' || agent.total_users < 0) {
        errors.push('ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط±ظ‚ظ… ظ…ظˆط¬ط¨');
      }
      
      if (typeof agent.active !== 'number' || agent.active < 0) {
        errors.push('ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ† ط§ظ„ظ†ط´ط·ظˆظ† ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط±ظ‚ظ… ظ…ظˆط¬ط¨');
      }
      
      if (typeof agent.prev_active !== 'number' || agent.prev_active < 0) {
        errors.push('ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ† ط§ظ„ظ†ط´ط·ظˆظ† ط§ظ„ط³ط§ط¨ظ‚ظˆظ† ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط±ظ‚ظ… ظ…ظˆط¬ط¨');
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    }

    async function testSupabaseConnection() {
      try {
        if (window.location.protocol === 'file:') {
        }
        
        updateConnectionStatus('connecting');
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          updateConnectionStatus('error');
          return false;
        }
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        const queryPromise = supabase
          .from('agents')
          .select('id, name, active, total_users, board_name') 
          .limit(1)
          .then(result => result);
        
        const result = await Promise.race([queryPromise, timeoutPromise]);
        const { data, error } = result;
          
        if (error) {
          
          if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
          }
          
          if (error.message && error.message.includes('board_name')) {
            const { data: retryData, error: retryError } = await supabase
              .from('agents')
              .select('id, name, active, total_users')
              .limit(1);
              
            if (retryError) {
              SupabaseManager.connectionStatus = 'error';
              updateConnectionStatus('error');
              return false;
            } else {
              SupabaseManager.connectionStatus = 'connected';
              updateConnectionStatus('connected');
              return true;
            }
          }
          
          SupabaseManager.connectionStatus = 'error';
          updateConnectionStatus('error');
          return false;
        } else {
          SupabaseManager.connectionStatus = 'connected';
          updateConnectionStatus('connected');
          return true;
        }
      } catch (e) {
        
        if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('timeout'))) {
        }
        
        SupabaseManager.connectionStatus = 'error';
        updateConnectionStatus('error');
        return false;
      }
    }

    const tbody = document.querySelector('#agentsTable tbody');
    const totalAgentsEl = document.getElementById('totalAgents');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalActiveEl = document.getElementById('totalActive');
    const overallActEl = document.getElementById('overallActivation');
    const phaseFilter = document.getElementById('phaseFilter');
    const searchBox = document.getElementById('searchBox');
    const sortBy = document.getElementById('sortBy');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnAddAgent = document.getElementById('btnAddAgent');
    const btnTheme = document.getElementById('btnTheme');

    const modalEdit = document.getElementById('modalEdit');
    const editName = document.getElementById('editName');
    const editTotal = document.getElementById('editTotal');
    const editReachedTotal = document.getElementById('editReachedTotal');
    const editActive = document.getElementById('editActive');
    const saveActiveBtn = document.getElementById('saveActive');
    const closeModalBtn = document.getElementById('closeModal');

    const modalAdd = document.getElementById('modalAdd');
    const closeAddModal = document.getElementById('closeAddModal');
    const saveNewAgent = document.getElementById('saveNewAgent');
    const modalEditInfo = document.getElementById('modalEditInfo');
    const closeInfoModal = document.getElementById('closeInfoModal');
    const saveInfo = document.getElementById('saveInfo');

    let barChart=null, pieChart=null, growthChart=null, phaseChart=null, deficitChart=null;
    let agents = [];
    let dbIdByLocalId = new Map();
    let localIdByDbId = new Map();

    function migrateData(){
      let changed = false;
      agents.forEach(a=>{
        const norm = normalizePhase(a.phase);
        if(a.phase !== norm){ a.phase = norm; changed = true; }
        if((a.name||'').trim() === 'abbas ط¹ط¨ط§ط³ ط­ظ„ظˆط§طµ' && a.phase !== 'PHASE1'){
          a.phase = 'PHASE1';
          changed = true;
        }
      });
      if(changed){ saveToStorage(); }
    }


    function parseDateAuto(s){
      if(!s) return null;
      if(s instanceof Date) return s;
      if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00');
      if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){
        const parts = s.split('/');
        return new Date(+parts[2], +parts[1]-1, +parts[0]);
      }
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }

    function monthsBetween(d1, d2){
      const y1=d1.getFullYear(), m1=d1.getMonth();
      const y2=d2.getFullYear(), m2=d2.getMonth();
      return Math.max(0, (y2 - y1)*12 + (m2 - m1));
    }

    function normalizePhase(value){
      const s = String(value||'').trim().toLowerCase();
      if(!s) return '';
      if(s.includes('phase2') || s.includes('phase 2') || s.includes('phase-2') || s.includes('ط§ظ„ظ…ط±ط­ظ„ط©') && s.includes('2')) return 'PHASE2';
      if(s.includes('phase3') || s.includes('phase 3') || s.includes('phase-3') || (s.includes('ط§ظ„ظ…ط±ط­ظ„ط©') && s.includes('3'))) return 'PHASE3';
      if(s.includes('old') || s.includes('ظ‚ط¯ظٹظ…') || s.includes('ط§ظ„ظ…ط´ط±ظˆط¹ ط§ظ„ظ‚ط¯ظٹظ…')) return 'OLD';
      if(s.includes('phase1') || s.includes('phase 1') || s.includes('phase-1') || s.includes('ط§ظ„ظ…ط´ط±ظˆط¹ ط§ظ„ط¬ط¯ظٹط¯')) return 'PHASE1';
      const up = s.toUpperCase();
      if(['PHASE1','PHASE2','PHASE3','OLD'].includes(up)) return up;
      return '';
    }

    function arabicPhaseLabel(phase){
      switch(String(phase||'').toUpperCase()){
        case 'PHASE1': return ' ط§ظ„ظ…ط±ط­ظ„ط© ط§ظ„ط«ط§ظ†ظٹط© ';
        case 'PHASE2': return ' ط§ظ„ظ…ط±ط­ظ„ط© ط§ظ„ط«ط§ظ†ظٹط© ';
        case 'PHASE3': return 'ط§ظ„ظ…ط±ط­ظ„ط© ط§ظ„ط«ط§ظ„ط«ط©';
        case 'OLD': return 'ط§ظ„ظ…ط´ط±ظˆط¹ ط§ظ„ظ‚ط¯ظٹظ…';
        default: return '';
      }
    }

    function toYMDLocal(d){
      const y=d.getFullYear();
      const m=String(d.getMonth()+1).padStart(2,'0');
      const day=String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    }

    function genId(){
      return 'a_' + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4);
    }

    function computeAgent(agent){
      if(!agent._id) agent._id = genId();
      const now = new Date();
      const contract = parseDateAuto(agent.contract_date) || now;
      const months = monthsBetween(contract, now);
      agent.contract_date = toYMDLocal(contract); 
      agent.months_since = months;
      agent.phase = normalizePhase(agent.phase);
      let required = months >= 8 ? 80 : 60;
      agent.required_rate = required;

      agent.total_users = Number(agent.total_users) || 0;
      agent.active = Number(agent.active) || 0;
      agent.reached_total = Number(agent.reached_total) || 0;
      
      if (!agent.reached_total && agent.active > 0) {
        agent.reached_total = agent.active;
      }
      
      agent.expired = Math.max(0, agent.reached_total - agent.active);

      agent.growth = Math.round(agent.active - Number(agent.prev_active||0));
      agent.activation_rate = agent.total_users ? +( (agent.active / agent.total_users) * 100 ) : 0;
      agent.activation_rate = Math.round(agent.activation_rate*10)/10;
      if(required !== null){
        const rawDeficit = required - agent.activation_rate;
        agent.deficit_percent = Math.max(0, Math.round(rawDeficit*10)/10);
        const neededUsers = Math.round((required/100) * agent.total_users);
        agent.required_users = neededUsers;
        agent.deficit_users = Math.max(0, neededUsers - agent.active);
      } else {
        agent.deficit_percent = 0;
        agent.required_users = 0;
        agent.deficit_users = 0;
      }

      if(months < 6) agent.status='ط¬ط¯ظٹط¯';
      else if(agent.activation_rate >= required + 5) agent.status='ظ…طھظپظˆظ‚';
      else if(agent.activation_rate >= required) agent.status='ظ…ط·ط§ط¨ظ‚';
      else agent.status='ط¹ط¬ط²';

      return agent;
    }

    function renderTable(){
      let filtered = agents.slice();
      
      

      const phase = phaseFilter.value;
      if(phase) {
        filtered = filtered.filter(a => (a.phase || '').toUpperCase() === phase.toUpperCase());
        
      }

      const q = (searchBox.value || '').trim().toLowerCase();
      if(q){
        filtered = filtered.filter(a => ((a.name||'') + ' ' + (a.itpc_site||'') + ' ' + arabicPhaseLabel(a.phase)).toLowerCase().includes(q));
        
      }

      const sort = sortBy.value;
      if(sort === 'total_users_desc') filtered.sort((a,b)=>b.total_users - a.total_users);
      else if(sort === 'active_desc') filtered.sort((a,b)=> b.active - a.active );
      else if(sort === 'deficit_desc') filtered.sort((a,b)=>b.deficit_users - a.deficit_users);
      else filtered.sort((a,b)=> (a.name||'').localeCompare(b.name || '', 'ar') );

      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
      
      if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="16" style="text-align:center; padding:40px; color:var(--text-secondary);">
            <div style="font-size:16px; font-weight:600; margin-bottom:8px;">ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ</div>
            <div style="font-size:12px; color:var(--text-tertiary);">
              ${window.location.protocol === 'file:' ? 
                'ظٹظ…ظƒظ†ظƒ ط¥ط¶ط§ظپط© ظˆظƒظ„ط§ط، ط¬ط¯ط¯ ط¨ط§ط³طھط®ط¯ط§ظ… ط²ط± "ط¥ط¶ط§ظپط© ظˆظƒظٹظ„". ط§ظ„ط¨ظٹط§ظ†ط§طھ ط³ظٹطھظ… ط­ظپط¸ظ‡ط§ ظ…ط­ظ„ظٹط§ظ‹.' : 
                'ظٹظ…ظƒظ†ظƒ ط¥ط¶ط§ظپط© ظˆظƒظ„ط§ط، ط¬ط¯ط¯ ط¨ط§ط³طھط®ط¯ط§ظ… ط²ط± "ط¥ط¶ط§ظپط© ظˆظƒظٹظ„".'}
            </div>
          </td>
        `;
        tbody.appendChild(emptyRow);
        updateStats([]);
        updateCharts([]);
        if(growthChart) growthChart.destroy();
        if(phaseChart) phaseChart.destroy();
        if(deficitChart) deficitChart.destroy();
        return;
      }
      
      const PHASE_ORDER = ['OLD','PHASE2','PHASE3'];
      const phaseToItems = {};
      filtered.forEach((a)=>{
        const key = (a.phase||'').toUpperCase();
        if(!phaseToItems[key]) phaseToItems[key] = [];
        phaseToItems[key].push(a);
      });
      
      
      
      const allPhases = PHASE_ORDER.filter(p=>phaseToItems[p] && phaseToItems[p].length>0);
      
      let runningIndex = 0;
      allPhases.forEach(phaseKey=>{
        const items = phaseToItems[phaseKey];
        
        const hdr = document.createElement('tr');
        hdr.className = 'phase-header';
        hdr.innerHTML = `<td colspan="16" style="text-align:right; font-weight:700; background:transparent; font-size:14px; padding:12px; border-bottom:1px solid var(--border-color); color:var(--text-primary);">${arabicPhaseLabel(phaseKey)}</td>`;
        tbody.appendChild(hdr);

        items.forEach((a)=>{
          const idx = runningIndex++;
          
        const tr = document.createElement('tr');
        const todayStr = toYMDLocal(new Date());
        let phoneDisplay = '-';
        if (a.phone) {
          const phones = a.phone.split(',').map(p => p.trim()).filter(p => p);
          if (phones.length > 0) {
            phoneDisplay = phones.map(p => `<a href="tel:${p}" class="phone-link">${escapeHtml(p)}</a>`).join('<br>');
          }
        }
        tr.innerHTML = `
          <td style="text-align:right; padding-right:8px; white-space:normal; word-wrap:break-word; background:transparent;">
            <div style="line-height:1.2; background:transparent;">
              <strong style="font-size:14px; display:block; word-break:break-word; background:transparent;">${escapeHtml(a.name||'---')}</strong>
              <small style="font-size:11px; color:var(--muted); word-break:break-word; background:transparent;">${escapeHtml(a.note||'')}</small>
            </div>
          </td>
          <td style="font-size:13px; font-weight:800; color:#000000;">${phoneDisplay}</td>
          <td style="font-size:13px; font-weight:800; color:#000000;">${a.contract_date}</td>
            <td style="font-size:13px; font-weight:800; color:#000000;">${todayStr}</td>
            <td style="font-size:13px; font-weight:800; color:#000000;">${escapeHtml(a.fdt||'')}</td>
          <td style="font-size:13px; font-weight:800; color:#000000;">${escapeHtml(a.board_name||'')}</td>
          <td style="font-weight:800; font-size:13px; color:#000000;">${num(a.total_users)}</td>
          <td style="font-weight:800; font-size:13px; color:#000000;">${num(a.active)}</td>
          <td style="font-weight:700; font-size:13px;"><span style="color: ${(a.growth||0) > 0 ? '#22c55e' : (a.growth||0) < 0 ? '#ef4444' : '#000000'} !important; font-weight:700;">${signedNum(a.growth||0)}</span></td>
          <td style="font-weight:700; font-size:13px;">${a.required_rate === null ? a.activation_rate + '%' : `<span style="${getActivationRateColor(a.activation_rate, a.required_rate)}">${a.activation_rate}%</span>`}</td>
          <td style="font-weight:800; font-size:13px; color:#000000;">${a.required_rate === null ? '-' : a.required_rate + '%'}</td>
            <td style="font-weight:800; font-size:13px; color:#000000;">${a.required_rate === null ? '-' : num(a.required_users)}</td>
          <td style="font-size:13px; font-weight:700;">${a.required_rate === null ? '-' : `<span style="${getDeficitColor(a.deficit_percent, a.required_rate)}">${a.deficit_percent + '%'}</span>`}</td>
          <td style="font-size:13px; font-weight:700;">${a.deficit_users ? `<span style="${getDeficitUsersColor(a.deficit_users, a.total_users)}">${num(a.deficit_users)}</span>` : '-'}</td>
          <td style="font-weight:800; font-size:13px; color:#000000;">${num(a.expired || 0)}</td>
          <td style="background:transparent;">
              <div class="flex" style="justify-content:center; gap:8px; flex-wrap:wrap; background:transparent;">
                <button class="btn secondary small" data-action="edit" data-id="${a._id}" style="display: ${(typeof authSystem !== 'undefined' && authSystem.canEdit()) ? 'inline-flex' : 'none'};">
                  <span class="icon">ًں”„</span>
                  طھط­ط¯ظٹط«
                </button>
                <button class="btn small" data-action="edit-info" data-id="${a._id}" style="display: ${(typeof authSystem !== 'undefined' && authSystem.canEdit()) ? 'inline-flex' : 'none'};">
                  <span class="icon">âœڈï¸ڈ</span>
                  طھط¹ط¯ظٹظ„
                </button>
              </div>
          </td>
        `;
        tbody.appendChild(tr);
        });

        const totals = items.reduce((acc, a)=>{
          acc.total += Number(a.total_users||0);
          acc.active += Number(a.active||0);
          acc.deficit_users += Number(a.deficit_users||0);
          acc.reached_total += Number(a.reached_total||0);
          acc.expired += Number(a.expired||0);
          return acc;
        }, {total:0, active:0, deficit_users:0, reached_total:0, expired:0});
        const sub = document.createElement('tr');
        sub.className = 'subtotal-title';
        sub.innerHTML = `
          <td colspan="5" style="text-align:right; font-weight:600; font-size:12px; padding:8px;">ظ…ط¬ظ…ظˆط¹ ${escapeHtml(arabicPhaseLabel(phaseKey))}</td>
          <td></td>
          <td style="font-weight:600; font-size:12px; padding:8px;">${num(totals.total)}</td>
          <td style="font-weight:600; font-size:12px; padding:8px;">${num(totals.active)}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td style="font-weight:600; font-size:12px; padding:8px;">${totals.deficit_users ? `<span style="${getDeficitUsersColor(totals.deficit_users, totals.total)}">${num(totals.deficit_users)}</span>` : '-'}</td>
          <td></td>
          <td style="font-weight:600; font-size:12px; padding:8px;">${num(totals.expired)}</td>
          <td></td>
        `;
        tbody.appendChild(sub);
      });

      updateStats(filtered);
      updateCharts(filtered);
      
      
      
      
      if (typeof authSystem !== 'undefined') {
        authSystem.updateElementVisibility();
      }
    }

    function updateStats(list){
      const totalAgents = list.length;
      const totalUsers = list.reduce((s,a)=>s + Number(a.total_users||0), 0);
      const totalActive = list.reduce((s,a)=>s + Number(a.active||0), 0);
      const overallActivation = totalUsers ? Math.round((totalActive / totalUsers) * 1000)/10 : 0;
      totalAgentsEl.textContent = num(totalAgents);
      totalUsersEl.textContent = num(totalUsers);
      totalActiveEl.textContent = num(totalActive);
      overallActEl.textContent = overallActivation + '%';
    }

    function updateCharts(filtered){
      const isLightMode = !document.documentElement.hasAttribute('data-theme') || document.documentElement.getAttribute('data-theme') !== 'dark';
      const textColor = isLightMode ? '#333333' : '#f5f5f5';
      const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
      const backgroundColor = isLightMode ? '#ffffff' : '#1a1a1a';

      const top = filtered.slice().sort((a,b)=>b.total_users - a.total_users).slice(0,10);
      const labels = top.map(a=>a.name || a.itpc_site || 'â€”');
      const totalData = top.map(a=>a.total_users);
      const activeData = top.map(a=>a.active);

      if(barChart) {
        barChart.destroy();
        barChart = null;
      }
      
      const barCanvas = document.getElementById('barChart');
      const existingBarChart = Chart.getChart(barCanvas);
      if(existingBarChart) {
        existingBarChart.destroy();
      }
      
      const barCtx = barCanvas.getContext('2d');
      barChart = new Chart(barCtx, {
        type:'bar',
        data:{
          labels,
          datasets:[
            { 
              label:'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†', 
              data: totalData,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.canvas;
                const ctx2d = canvas.getContext('2d');
                const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
                gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.85)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
                return gradient;
              },
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2.5,
              borderRadius: 10,
              borderSkipped: false,
              barThickness: 'flex',
              maxBarThickness: 50,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: 'rgba(59, 130, 246, 0.3)',
            },
            { 
              label:'ط§ظ„ظ…ط³طھط®ط¯ظ…ظˆظ† ط§ظ„ظ†ط´ط·ظˆظ†', 
              data: activeData,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.canvas;
                const ctx2d = canvas.getContext('2d');
                const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
                gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.85)');
                gradient.addColorStop(1, 'rgba(74, 222, 128, 0.8)');
                return gradient;
              },
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2.5,
              borderRadius: 10,
              borderSkipped: false,
              barThickness: 'flex',
              maxBarThickness: 50,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: 'rgba(16, 185, 129, 0.3)',
            }
          ]
        },
        options:{
          responsive:true,
          maintainAspectRatio:true,
          aspectRatio: 1.5,
          animation: {
            duration: 2000,
            easing: 'easeOutQuart',
            onComplete: function() {
              try {
                const chart = this.chart;
                if (chart && chart.canvas) {
                  const ctx = chart.canvas.getContext('2d');
                  if (ctx) {
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.restore();
                  }
                }
              } catch (e) {
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins:{
            legend:{
              display:true, 
              position:'top',
              align: 'center',
              labels:{
                color: textColor,
                font: {
                  size: 15,
                  weight: '700',
                  family: "'Cairo', sans-serif"
                },
                padding: 18,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 14,
                boxHeight: 14,
                textAlign: 'right'
              },
              title: {
                display: false
              }
            },
            tooltip: {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)',
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isLightMode ? 'rgba(128, 28, 50, 0.2)' : 'rgba(255, 71, 87, 0.3)',
              borderWidth: 2,
              padding: 16,
              cornerRadius: 12,
              displayColors: true,
              boxPadding: 8,
              titleFont: {
                size: 15,
                weight: 'bold',
                family: "'Cairo', sans-serif"
              },
              bodyFont: {
                  size: 14,
                weight: '600',
                family: "'Cairo', sans-serif"
              },
              footerFont: {
                size: 12,
                family: "'Cairo', sans-serif"
              },
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + num(context.parsed.y) + ' ظ…ط³طھط®ط¯ظ…';
                },
                labelColor: function(context) {
                  return {
                    borderColor: context.dataset.borderColor,
                    backgroundColor: context.dataset.backgroundColor,
                    borderWidth: 2,
                    borderRadius: 4
                  };
                }
              },
              titleSpacing: 8,
              bodySpacing: 6,
              footerSpacing: 6,
              usePointStyle: true,
              boxWidth: 12,
              boxHeight: 12
            }
          },
          scales:{
            x:{
              ticks:{
                color: textColor,
                font: {
                  size: 11,
                  weight: 'bold',
                  family: "'Cairo', sans-serif"
                },
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: gridColor,
                drawBorder: false
              }
            }, 
            y:{
              beginAtZero:true, 
              ticks:{
                color: textColor,
                font: {
                  size: 12,
                  weight: 'bold',
                  family: "'Cairo', sans-serif"
                },
                callback: function(value) {
                  return num(value);
                }
              },
              grid: {
                color: gridColor,
                drawBorder: false
              }
            }
          }
        }
      });

      const sumActive = filtered.reduce((s,a)=>s + a.active,0);
      const sumTotal = filtered.reduce((s,a)=>s + a.total_users,0);
      const inactive = Math.max(0, sumTotal - sumActive);
      
      if(pieChart) {
        pieChart.destroy();
        pieChart = null;
      }
      
      const pieCanvas = document.getElementById('pieChart');
      const existingPieChart = Chart.getChart(pieCanvas);
      if(existingPieChart) {
        existingPieChart.destroy();
      }
      
      const pieCtx = pieCanvas.getContext('2d');
      pieChart = new Chart(pieCtx, {
        type:'doughnut',
        data:{
          labels:['ظ†ط´ط·ظˆظ†','ط؛ظٹط± ظ†ط´ط·ظٹظ†'],
            datasets:[{ 
            data:[sumActive, inactive],
            backgroundColor: (ctx) => {
              const chart = ctx.chart;
              const {chartArea} = chart;
              if (!chartArea) {
                return ['rgba(16, 185, 129, 0.9)', 'rgba(239, 68, 68, 0.9)'];
              }
              const centerX = (chartArea.left + chartArea.right) / 2;
              const centerY = (chartArea.top + chartArea.bottom) / 2;
              const r = Math.min(
                (chartArea.right - chartArea.left) / 2,
                (chartArea.bottom - chartArea.top) / 2
              );
              
              const canvasCtx = chart.canvas ? chart.canvas.getContext('2d') : null;
              if (!canvasCtx) return 'rgba(16, 185, 129, 0.8)';
              
              const gradient1 = canvasCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
              gradient1.addColorStop(0, 'rgba(16, 185, 129, 1)');
              gradient1.addColorStop(0.7, 'rgba(34, 197, 94, 0.9)');
              gradient1.addColorStop(1, 'rgba(74, 222, 128, 0.85)');
              
              const gradient2 = canvasCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
              gradient2.addColorStop(0, 'rgba(239, 68, 68, 1)');
              gradient2.addColorStop(0.7, 'rgba(248, 113, 113, 0.9)');
              gradient2.addColorStop(1, 'rgba(252, 165, 165, 0.85)');
              
              return [gradient1, gradient2];
            },
            borderColor: [
              'rgba(255, 255, 255, 0.9)',
              'rgba(255, 255, 255, 0.9)'
            ],
            borderWidth: 4,
            hoverOffset: 15,
            hoverBorderWidth: 5,
            cutout: '60%',
            spacing: 3
          }]
        },
        options:{
          responsive:true, 
          maintainAspectRatio:true,
          aspectRatio: 1.3,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 2000,
            easing: 'easeOutQuart'
          },
          plugins:{
            legend:{
              position:'bottom',
              align: 'center',
              labels:{
                color: textColor,
                font: {
                  size: 15,
                  weight: '700',
                  family: "'Cairo', sans-serif"
                },
                padding: 18,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 14,
                boxHeight: 14,
                textAlign: 'right'
              }
            },
            tooltip: {
              backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)',
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isLightMode ? 'rgba(128, 28, 50, 0.2)' : 'rgba(255, 71, 87, 0.3)',
              borderWidth: 2,
              padding: 16,
              cornerRadius: 12,
              displayColors: true,
              boxPadding: 8,
              titleFont: {
                size: 15,
                weight: 'bold',
                family: "'Cairo', sans-serif"
              },
              bodyFont: {
                  size: 14,
                weight: '600',
                family: "'Cairo', sans-serif"
              },
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return label + ': ' + num(value) + ' (' + percentage + '%)';
                },
                labelColor: function(context) {
                  const bgColors = context.dataset.backgroundColor;
                  const borderColors = context.dataset.borderColor;
                  return {
                    borderColor: Array.isArray(borderColors) ? borderColors[context.dataIndex] : borderColors,
                    backgroundColor: Array.isArray(bgColors) ? bgColors[context.dataIndex] : bgColors,
                    borderWidth: 2,
                    borderRadius: 4
                  };
                }
              },
              usePointStyle: true,
              boxWidth: 12,
              boxHeight: 12
            }
          }
        }
      });

      const growthData = filtered
        .filter(a => (a.growth || 0) !== 0)
        .sort((a,b)=>Math.abs(b.growth||0) - Math.abs(a.growth||0));
      const growthLabels = growthData.map(a=>a.name || 'â€”');
      const growthValues = growthData.map(a=>a.growth||0);
      const growthColors = growthValues.map(v => v > 0 ? 'rgba(16, 185, 129, 0.8)' : v < 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(156, 163, 175, 0.8)');

      const growthCanvas = document.getElementById('growthChart');
      if(growthChart) {
        growthChart.destroy();
        growthChart = null;
      }
      const existingGrowthChart = Chart.getChart(growthCanvas);
      if(existingGrowthChart) {
        existingGrowthChart.destroy();
      }
      if(growthData.length > 0) {
        growthChart = new Chart(growthCanvas.getContext('2d'), {
          type:'bar',
          data:{
            labels: growthLabels,
            datasets:[{ 
              label:'ط§ظ„ظ†ظ…ظˆ ط§ظ„ط£ط³ط¨ظˆط¹ظٹ',
              data: growthValues,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.canvas;
                const ctx2d = canvas.getContext('2d');
                return growthValues.map(v => {
                  const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
                  if(v > 0) {
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
                    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.9)');
                    gradient.addColorStop(1, 'rgba(74, 222, 128, 0.85)');
                  } else if(v < 0) {
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
                    gradient.addColorStop(0.5, 'rgba(248, 113, 113, 0.9)');
                    gradient.addColorStop(1, 'rgba(252, 165, 165, 0.85)');
                  } else {
                    gradient.addColorStop(0, 'rgba(156, 163, 175, 0.8)');
                    gradient.addColorStop(1, 'rgba(209, 213, 219, 0.7)');
                  }
                  return gradient;
                });
              },
              borderColor: growthValues.map(v => v > 0 ? 'rgba(16, 185, 129, 1)' : v < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(156, 163, 175, 1)'),
              borderWidth: 2.5,
              borderRadius: 10,
              barThickness: 'flex',
              maxBarThickness: growthData.length > 20 ? 25 : 45,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: growthValues.map(v => v > 0 ? 'rgba(16, 185, 129, 0.3)' : v < 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(156, 163, 175, 0.2)')
            }]
          },
          options:{
            responsive:true,
            maintainAspectRatio:false,
            animation: {
              duration: 2000,
              easing: 'easeOutQuart'
            },
            plugins:{
              legend:{
                display:false
              },
              tooltip: {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: isLightMode ? 'rgba(128, 28, 50, 0.2)' : 'rgba(255, 71, 87, 0.3)',
                borderWidth: 2,
                padding: 16,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 8,
                titleFont: {
                  size: 15,
                  weight: 'bold',
                  family: "'Cairo', sans-serif"
                },
                bodyFont: {
                  size: 14,
                  weight: '600',
                  family: "'Cairo', sans-serif"
                },
                callbacks: {
                  label: function(context) {
                    const value = context.parsed.y;
                    return 'ط§ظ„ظ†ظ…ظˆ: ' + signedNum(value) + ' ظ…ط³طھط®ط¯ظ…';
                  },
                  labelColor: function(context) {
                    return {
                      borderColor: context.dataset.borderColor[context.dataIndex],
                      backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                      borderWidth: 2,
                      borderRadius: 4
                    };
                  }
                },
                usePointStyle: true,
                boxWidth: 12,
                boxHeight: 12
              }
            },
            scales:{
              x:{
                ticks:{
                  color: textColor,
                  font: {
                    size: growthData.length > 20 ? 9 : 11,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  },
                  maxRotation: growthData.length > 20 ? 90 : 45,
                  minRotation: growthData.length > 20 ? 90 : 45
                },
                grid: {
                  display: false
                }
              }, 
              y:{
                beginAtZero:false,
                ticks:{
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  },
                  callback: function(value) {
                    return signedNum(value);
                  }
                },
                grid: {
                  color: gridColor,
                  drawBorder: false
                }
              }
            }
          }
        });
      } else {
        if(growthCanvas) {
          growthCanvas.style.display = 'none';
          const parent = growthCanvas.parentElement;
          if(!parent.querySelector('.no-data-message')) {
            const msg = document.createElement('div');
            msg.className = 'no-data-message';
            msg.style.cssText = 'text-align:center; padding:40px; color:var(--text-secondary); font-size:14px;';
            msg.textContent = 'ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ ظ„ظ„ظ†ظ…ظˆ ط§ظ„ط£ط³ط¨ظˆط¹ظٹ';
            parent.appendChild(msg);
          }
        }
      }

      const phases = ['OLD', 'PHASE2', 'PHASE3'];
      const phaseData = phases.map(phase => {
        const phaseAgents = filtered.filter(a => (a.phase || '').toUpperCase() === phase);
        if(phaseAgents.length === 0) return null;
        const total = phaseAgents.reduce((s,a)=>s + (a.total_users||0), 0);
        const active = phaseAgents.reduce((s,a)=>s + (a.active||0), 0);
        return total > 0 ? (active / total * 100) : 0;
      }).filter(v => v !== null);
      const phaseLabels = phases.filter((phase, idx) => phaseData[idx] !== null).map(p => arabicPhaseLabel(p));

      const phaseCanvas = document.getElementById('phaseChart');
      if(phaseChart) {
        phaseChart.destroy();
        phaseChart = null;
      }
      const existingPhaseChart = Chart.getChart(phaseCanvas);
      if(existingPhaseChart) {
        existingPhaseChart.destroy();
      }
      if(phaseData.length > 0) {
        phaseChart = new Chart(phaseCanvas.getContext('2d'), {
          type:'bar',
          data:{
            labels: phaseLabels,
            datasets:[{ 
              label:'ظ…ط¹ط¯ظ„ ط§ظ„طھظپط¹ظٹظ„ (%)',
              data: phaseData,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.canvas;
                const ctx2d = canvas.getContext('2d');
                const gradients = [
                  ctx2d.createLinearGradient(0, 0, 0, canvas.height),
                  ctx2d.createLinearGradient(0, 0, 0, canvas.height),
                  ctx2d.createLinearGradient(0, 0, 0, canvas.height)
                ];
                gradients[0].addColorStop(0, 'rgba(59, 130, 246, 0.95)');
                gradients[0].addColorStop(0.5, 'rgba(99, 102, 241, 0.9)');
                gradients[0].addColorStop(1, 'rgba(139, 92, 246, 0.85)');
                gradients[1].addColorStop(0, 'rgba(139, 92, 246, 0.95)');
                gradients[1].addColorStop(0.5, 'rgba(168, 85, 247, 0.9)');
                gradients[1].addColorStop(1, 'rgba(192, 132, 252, 0.85)');
                gradients[2].addColorStop(0, 'rgba(236, 72, 153, 0.95)');
                gradients[2].addColorStop(0.5, 'rgba(244, 63, 94, 0.9)');
                gradients[2].addColorStop(1, 'rgba(251, 113, 133, 0.85)');
                return gradients.slice(0, phaseData.length);
              },
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(236, 72, 153, 1)'
              ],
              borderWidth: 2.5,
              borderRadius: 10,
              barThickness: 'flex',
              maxBarThickness: 60,
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 8,
              shadowColor: 'rgba(128, 28, 50, 0.2)'
            }]
          },
          options:{
            responsive:true,
            maintainAspectRatio:true,
            aspectRatio: 1.5,
            animation: {
              duration: 2000,
              easing: 'easeOutQuart'
            },
            plugins:{
              legend:{
                display:false
              },
              tooltip: {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: isLightMode ? 'rgba(128, 28, 50, 0.2)' : 'rgba(255, 71, 87, 0.3)',
                borderWidth: 2,
                padding: 16,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 8,
                titleFont: {
                  size: 15,
                  weight: 'bold',
                  family: "'Cairo', sans-serif"
                },
                bodyFont: {
                  size: 14,
                  weight: '600',
                  family: "'Cairo', sans-serif"
                },
                callbacks: {
                  label: function(context) {
                    return 'ظ…ط¹ط¯ظ„ ط§ظ„طھظپط¹ظٹظ„: ' + context.parsed.y.toFixed(1) + '%';
                  },
                  labelColor: function(context) {
                    return {
                      borderColor: context.dataset.borderColor[context.dataIndex],
                      backgroundColor: context.dataset.backgroundColor[context.dataIndex],
                      borderWidth: 2,
                      borderRadius: 4
                    };
                  }
                },
                usePointStyle: true,
                boxWidth: 12,
                boxHeight: 12
              }
            },
            scales:{
              x:{
                ticks:{
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  }
                },
                grid: {
                  display: false
                }
              }, 
              y:{
                beginAtZero:true,
                max: 100,
                ticks:{
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  },
                  callback: function(value) {
                    return value + '%';
                  }
                },
                grid: {
                  color: gridColor,
                  drawBorder: false
                }
              }
            }
          }
        });
      } else {
        if(phaseCanvas) {
          phaseCanvas.style.display = 'none';
          const parent = phaseCanvas.parentElement;
          if(!parent.querySelector('.no-data-message')) {
            const msg = document.createElement('div');
            msg.className = 'no-data-message';
            msg.style.cssText = 'text-align:center; padding:40px; color:var(--text-secondary); font-size:14px;';
            msg.textContent = 'ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ ظ„ظ„ظ…ط±ط§ط­ظ„';
            parent.appendChild(msg);
          }
        }
      }

      const deficitData = filtered
        .filter(a => (a.deficit_users || 0) > 0)
        .sort((a,b)=>(b.deficit_users||0) - (a.deficit_users||0));
      const deficitLabels = deficitData.map(a=>a.name || 'â€”');
      const deficitValues = deficitData.map(a=>a.deficit_users||0);

      const deficitCanvas = document.getElementById('deficitChart');
      if(deficitChart) {
        deficitChart.destroy();
        deficitChart = null;
      }
      const existingDeficitChart = Chart.getChart(deficitCanvas);
      if(existingDeficitChart) {
        existingDeficitChart.destroy();
      }
      if(deficitData.length > 0) {
        if(deficitCanvas) {
          deficitCanvas.style.display = 'block';
          const parent = deficitCanvas.parentElement;
          const noDataMsg = parent.querySelector('.no-data-message');
          if(noDataMsg) noDataMsg.remove();
        }
        deficitChart = new Chart(deficitCanvas.getContext('2d'), {
          type:'bar',
          data:{
            labels: deficitLabels,
            datasets:[{ 
              label:'ط¹ط¬ط² ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†',
              data: deficitValues,
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.canvas;
                const ctx2d = canvas.getContext('2d');
                return deficitValues.map((v, idx) => {
                  const total = deficitData[idx].total_users || 1;
                  const percent = (v / total) * 100;
                  const gradient = ctx2d.createLinearGradient(0, 0, canvas.width, 0);
                  if(percent < 5) {
                    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
                    gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.9)');
                    gradient.addColorStop(1, 'rgba(253, 224, 71, 0.85)');
                  } else if(percent < 10) {
                    gradient.addColorStop(0, 'rgba(251, 146, 60, 0.95)');
                    gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.9)');
                    gradient.addColorStop(1, 'rgba(234, 88, 12, 0.85)');
                  } else {
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
                    gradient.addColorStop(0.5, 'rgba(248, 113, 113, 0.9)');
                    gradient.addColorStop(1, 'rgba(220, 38, 38, 0.85)');
                  }
                  return gradient;
                });
              },
              borderColor: deficitValues.map((v, idx) => {
                const total = deficitData[idx].total_users || 1;
                const percent = (v / total) * 100;
                if(percent < 5) return 'rgba(245, 158, 11, 1)';
                if(percent < 10) return 'rgba(251, 146, 60, 1)';
                return 'rgba(239, 68, 68, 1)';
              }),
              borderWidth: 2.5,
              borderRadius: 10,
              barThickness: 'flex',
              maxBarThickness: deficitData.length > 20 ? 30 : 50,
              shadowOffsetX: 4,
              shadowOffsetY: 0,
              shadowBlur: 8,
              shadowColor: deficitValues.map((v, idx) => {
                const total = deficitData[idx].total_users || 1;
                const percent = (v / total) * 100;
                if(percent < 5) return 'rgba(245, 158, 11, 0.3)';
                if(percent < 10) return 'rgba(251, 146, 60, 0.3)';
                return 'rgba(239, 68, 68, 0.3)';
              })
            }]
          },
          options:{
            indexAxis: 'y',
            responsive:true,
            maintainAspectRatio:false,
            animation: {
              duration: 2000,
              easing: 'easeOutQuart'
            },
            plugins:{
              legend:{
                display:false
              },
              tooltip: {
                backgroundColor: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 26, 26, 0.98)',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: isLightMode ? 'rgba(128, 28, 50, 0.2)' : 'rgba(255, 71, 87, 0.3)',
                borderWidth: 2,
                padding: 16,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 8,
                titleFont: {
                  size: 15,
                  weight: 'bold',
                  family: "'Cairo', sans-serif"
                },
                bodyFont: {
                  size: 14,
                  weight: '600',
                  family: "'Cairo', sans-serif"
                },
                callbacks: {
                  label: function(context) {
                    const value = context.parsed.x;
                    const agent = deficitData[context.dataIndex];
                    const percent = agent.total_users > 0 ? ((value / agent.total_users) * 100).toFixed(1) : 0;
                    return 'ط§ظ„ط¹ط¬ط²: ' + num(value) + ' ظ…ط³طھط®ط¯ظ… (' + percent + '%)';
                  },
                  labelColor: function(context) {
                    const idx = context.dataIndex;
                    const total = deficitData[idx].total_users || 1;
                    const percent = (deficitValues[idx] / total) * 100;
                    let bgColor;
                    if(percent < 5) bgColor = 'rgba(245, 158, 11, 0.9)';
                    else if(percent < 10) bgColor = 'rgba(251, 146, 60, 0.9)';
                    else bgColor = 'rgba(239, 68, 68, 0.9)';
                    return {
                      borderColor: context.dataset.borderColor[idx],
                      backgroundColor: bgColor,
                      borderWidth: 2,
                      borderRadius: 4
                    };
                  }
                },
                usePointStyle: true,
                boxWidth: 12,
                boxHeight: 12
              }
            },
            scales:{
              x:{
                beginAtZero:true,
                ticks:{
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  },
                  callback: function(value) {
                    return num(value);
                  }
                },
                grid: {
                  color: gridColor,
                  drawBorder: false
                }
              }, 
              y:{
                ticks:{
                  color: textColor,
                  font: {
                    size: deficitData.length > 20 ? 9 : 11,
                    weight: 'bold',
                    family: "'Cairo', sans-serif"
                  }
                },
                grid: {
                  display: false
                }
              }
            }
          }
        });
      } else {
        if(deficitCanvas) {
          deficitCanvas.style.display = 'none';
          const parent = deficitCanvas.parentElement;
          if(!parent.querySelector('.no-data-message')) {
            const msg = document.createElement('div');
            msg.className = 'no-data-message';
            msg.style.cssText = 'text-align:center; padding:40px; color:var(--text-secondary); font-size:14px;';
            msg.textContent = 'ظ„ط§ ظٹظˆط¬ط¯ ط¹ط¬ط² ظپظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†';
            parent.appendChild(msg);
          }
        }
      }
      
      if(growthCanvas && growthData.length > 0) {
        growthCanvas.style.display = 'block';
        const parent = growthCanvas.parentElement;
        const noDataMsg = parent.querySelector('.no-data-message');
        if(noDataMsg) noDataMsg.remove();
      }
      
      if(phaseCanvas && phaseData.length > 0) {
        phaseCanvas.style.display = 'block';
        const parent = phaseCanvas.parentElement;
        const noDataMsg = parent.querySelector('.no-data-message');
        if(noDataMsg) noDataMsg.remove();
      }
    }

    function num(n){ 
      const formatted = new Intl.NumberFormat('en-US').format(Number(n||0));
      return formatted;
    }
    function signedNum(n){ if(n>0) return '+'+num(n); if(n<0) return num(n); return num(0); }
    function statusBadge(status){
      if(status==='ظ…طھظپظˆظ‚') return `<span class="badge good" style="font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${status}</span>`;
      if(status==='ظ…ط·ط§ط¨ظ‚') return `<span class="badge ok" style="font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${status}</span>`;
      if(status==='ط¹ط¬ط²') return `<span class="badge fail" style="font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${status}</span>`;
      if(status==='ط¬ط¯ظٹط¯') return `<span class="badge" style="background:rgba(128,28,50,0.2); color:#801c32; border:1px solid rgba(128,28,50,0.4); font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${status}</span>`;
      return `<span class="badge" style="background:rgba(128,28,50,0.08); color:#801c32; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${status}</span>`;
    }
    
    function getDeficitColor(deficitPercent, requiredRate) {
      if (requiredRate === null || requiredRate === 0) {
        const isDark = document.documentElement.hasAttribute('data-theme') && document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? 'color: #ffffff !important; font-weight: 700;' : 'color: #000000 !important; font-weight: 700;';
      }
      
      if (deficitPercent === 0 || deficitPercent < 0.1) {
        return 'color: #22c55e !important; font-weight: 700;';
      }
      
      const threshold = requiredRate * 0.2;
      if (deficitPercent <= threshold) {
        return 'color: #f97316 !important; font-weight: 700;';
      }
      
      return 'color: #ef4444 !important; font-weight: 700;';
    }
    
    function getDeficitUsersColor(deficitUsers, totalUsers) {
      if (totalUsers === 0) {
        const isDark = document.documentElement.hasAttribute('data-theme') && document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? 'color: #ffffff !important; font-weight: 700;' : 'color: #000000 !important; font-weight: 700;';
      }
      
      if (deficitUsers === 0) {
        return 'color: #22c55e !important; font-weight: 700;';
      }
      
      const threshold = totalUsers * 0.05;
      if (deficitUsers <= threshold) {
        return 'color: #f97316 !important; font-weight: 700;';
      }
      
      return 'color: #ef4444 !important; font-weight: 700;';
    }
    
    function getDeficitUsersColorForReport(deficitUsers, totalUsers) {
      if (totalUsers === 0) {
        return 'color: #000000 !important; font-weight: 700;';
      }
      
      if (deficitUsers === 0) {
        return 'color: #22c55e !important; font-weight: 700;';
      }
      
      const threshold = totalUsers * 0.05;
      if (deficitUsers <= threshold) {
        return 'color: #f97316 !important; font-weight: 700;';
      }
      
      return 'color: #ef4444 !important; font-weight: 700;';
    }
    
    function getActivationRateColor(activationRate, requiredRate) {
      if (requiredRate === null || requiredRate === 0) {
        const isDark = document.documentElement.hasAttribute('data-theme') && document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? 'color: #ffffff !important; font-weight: 700;' : 'color: #000000 !important; font-weight: 700;';
      }
      
      if (activationRate >= 50) {
        return 'color: #f97316 !important; font-weight: 700;';
      }
      
      const diff = Math.abs(activationRate - requiredRate);
      
      if (diff < 0.5) {
        return 'color: #22c55e !important; font-weight: 700;';
      }
      
      const threshold = requiredRate * 0.05;
      if (diff <= threshold) {
        return 'color: #f97316 !important; font-weight: 700;';
      }
      
      return 'color: #ef4444 !important; font-weight: 700;';
    }
    function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    tbody.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('button[data-action="edit"]');
      if(!btn) return;
      const id = btn.dataset.id;
      if(!id) return;
      const idx = agents.findIndex(a=>a._id === id);
      openEditModal(idx);
    });

    tbody.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('button[data-action="edit-info"]');
      if(!btn) return;
      const id = btn.dataset.id;
      const idx = agents.findIndex(a=>a._id === id);
      if(idx < 0) return;
      const a = agents[idx];
      modalEditInfo.classList.add('open');
      document.getElementById('info_name').value = a.name || '';
      document.getElementById('info_note').value = a.note || '';
      document.getElementById('info_date').value = a.contract_date || '';
      document.getElementById('info_phase').value = a.phase || '';
      document.getElementById('info_site').value = a.itpc_site || '';
      document.getElementById('info_fdt').value = a.fdt || '';
      document.getElementById('info_total').value = a.total_users || 0;
      document.getElementById('info_phone').value = a.phone || '';
      const infoBoardEl = document.getElementById('info_board'); if(infoBoardEl) infoBoardEl.value = a.board_name || '';
      modalEditInfo.dataset.editIndex = String(idx);
      
      setTimeout(() => positionModal(modalEditInfo), 10);
    });

    tbody.addEventListener('click', async (ev)=>{
      const btn = ev.target.closest('button[data-action="delete"]');
      if(!btn) return;
      const id = btn.dataset.id;
      const idx = agents.findIndex(a=>a._id === id);
      if(idx < 0) return;
      const a = agents[idx];
      
      if(!confirm(`ظ‡ظ„ طھط±ظٹط¯ ط­ط°ظپ ط§ظ„ظˆظƒظٹظ„: ${a.name || ''} طں`)) return;
      
      try{
        const dbId = dbIdByLocalId.get(a._id);
        if(dbId){
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase.from('agents').delete().eq('id', dbId);
          }
          localIdByDbId.delete(dbId);
          dbIdByLocalId.delete(a._id);
        }
      }catch(e){ 
      }
      
      agents.splice(idx,1);
      saveToStorage();
      renderTable();
      
    });

    closeInfoModal.addEventListener('click', ()=> closeModal(modalEditInfo));
    saveInfo.addEventListener('click', async ()=>{
      const idx = Number(modalEditInfo.dataset.editIndex || -1);
      if(idx < 0) return;
      const a = agents[idx];
      
      a.name = document.getElementById('info_name').value.trim() || a.name;
      a.note = document.getElementById('info_note').value.trim();
      a.contract_date = document.getElementById('info_date').value || a.contract_date;
      a.phase = normalizePhase(document.getElementById('info_phase').value);
      a.itpc_site = document.getElementById('info_site').value.trim();
      a.fdt = document.getElementById('info_fdt').value.trim();
      a.total_users = Number(document.getElementById('info_total').value || a.total_users);
      a.phone = (document.getElementById('info_phone')?.value || '').trim();
      a.board_name = (document.getElementById('info_board')?.value || '').trim();
      computeAgent(a);
      
      try{
        const dbId = dbIdByLocalId.get(a._id);
        
        
        if(dbId){
          
          const supabase = getSupabaseClient();
          if (!supabase) {
            return;
          }
          
          const updateData = {
            name: a.name,
            note: a.note || '',
            contract_date: a.contract_date || '',
            phase: a.phase || '',
            total_users: a.total_users || 0,
            active: a.active || 0,
            prev_active: a.prev_active || 0
          };
          
          if (a.itpc_site !== undefined) {
            updateData.site = String(a.itpc_site || '');
          }
          if (a.fdt !== undefined) {
            updateData.fdt = String(a.fdt || '');
          }
          if (a.board_name !== undefined) {
            updateData.board_name = String(a.board_name || '');
          }
          if (a.phone !== undefined) {
            updateData.phone = String(a.phone || '');
          }
          
          let { error } = await supabase
            .from('agents')
            .update(updateData)
            .eq('id', dbId);
            
          if(error) {
            if (error.message && (error.message.includes('site') || error.message.includes('fdt') || error.message.includes('board_name') || error.message.includes('phone') || error.message.includes('column'))) {
              const updateDataMinimal = {
                name: a.name,
                note: a.note || '',
                contract_date: a.contract_date || '',
                phase: a.phase || '',
                total_users: a.total_users || 0,
                active: a.active || 0,
                prev_active: a.prev_active || 0
              };
              
              const { error: retryError } = await supabase
                .from('agents')
                .update(updateDataMinimal)
                .eq('id', dbId);
                
              if (retryError) {
              } else {
              }
            } else {
            }
          } else {
          }
        } else {
          
        }
      }catch(e){  
      }
      
      saveToStorage();
      renderTable();
      closeModal(modalEditInfo);
      
    });

    document.getElementById('deleteFromInfoModal').addEventListener('click', async ()=>{
      const idx = Number(modalEditInfo.dataset.editIndex || -1);
      if(idx < 0) return;
      const a = agents[idx];
      if(!confirm(`ظ‡ظ„ طھط±ظٹط¯ ط­ط°ظپ ط§ظ„ظˆظƒظٹظ„: ${a.name || ''} طں`)) return;
      try{
        const dbId = dbIdByLocalId.get(a._id);
        if(dbId){
          const supabase = getSupabaseClient();
          if (supabase) {
          const { error } = await supabase.from('agents').delete().eq('id', dbId);
          }
          localIdByDbId.delete(dbId);
          dbIdByLocalId.delete(a._id);
        }
      }catch(e){ 
      }
      agents.splice(idx,1);
      saveToStorage();
      renderTable();
      modalEditInfo.classList.remove('open');
    });


    function openEditModal(idx){
      const agent = agents[idx];
      if(!agent) return;
      modalEdit.classList.add('open');
      editName.value = agent.name || '';
      editTotal.value = agent.total_users || 0;
      editReachedTotal.value = agent.reached_total || agent.active || 0;
      editActive.value = agent.active || 0;
      modalEdit.dataset.editIndex = idx;
      
      setTimeout(() => positionModal(modalEdit), 10);
    }

    closeModalBtn.addEventListener('click', ()=> closeModal(modalEdit));
    saveActiveBtn.addEventListener('click', async ()=>{
      const idx = Number(modalEdit.dataset.editIndex || -1);
      if(idx < 0) return;
      const agent = agents[idx];
      if(!agent) return;
      const newReachedTotal = Number(editReachedTotal.value || 0);
      const newActive = Number(editActive.value || 0);
      
      if(!Array.isArray(agent.history)) agent.history = [];
      agent.history.push({ date: toYMDLocal(new Date()), active: Number(agent.active||0) });
      agent.prev_active = Number(agent.active||0); 
      agent.reached_total = newReachedTotal || newActive;
      agent.active = newActive;
      computeAgent(agent);
      
      try{
        const dbId = dbIdByLocalId.get(agent._id);
        if(dbId){
          
          const supabase = getSupabaseClient();
          if (supabase) {
          const { error } = await supabase
            .from('agents')
              .update({ 
                active: agent.active, 
                prev_active: agent.prev_active,
                reached_total: agent.reached_total,
                board_name: agent.board_name
              })
            .eq('id', dbId);
          if(error) {
          } else {
            
            }
          } else {
            
          }
        } else {
          
        }
      }catch(e){  
      }
      
      saveToStorage();
      renderTable();
      closeModal(modalEdit);
      
    });

    btnAddAgent.addEventListener('click', ()=> {
      modalAdd.classList.add('open');
      
      setTimeout(() => positionModal(modalAdd), 10);
    });
    
    closeAddModal.addEventListener('click', ()=> closeModal(modalAdd));
    saveNewAgent.addEventListener('click', async ()=>{
      const name = document.getElementById('new_name').value.trim();
      const date = document.getElementById('new_date').value;
      const phase = normalizePhase(document.getElementById('new_phase').value);
      const site = document.getElementById('new_site').value.trim();
      const fdt = document.getElementById('new_fdt').value.trim();
      const note = document.getElementById('new_note').value.trim();
      const board = (document.getElementById('new_board')?.value || '').trim();
      const phone = (document.getElementById('new_phone')?.value || '').trim();
      const total = Number(document.getElementById('new_total').value || 0);
      const reached_total = Number(document.getElementById('new_reached_total').value || 0);
      const active = Number(document.getElementById('new_active').value || 0);
      
      if(!name){
        if (typeof notifications !== 'undefined') {
          notifications.warning('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„');
        } else {
          alert('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„');
        }
        return;
      }
      
      const obj = { 
        name, 
        contract_date: date || toYMDLocal(new Date()), 
        phase, 
        itpc_site: site, 
        fdt, 
        note, 
        board_name: board, 
        phone,
        total_users: total, 
        reached_total: reached_total || active,
        active, 
        prev_active: 0 
      };
      
      
      computeAgent(obj);
      
      const validation = validateAgentData(obj);
      if (!validation.isValid) {
        const errorMsg = 'ط®ط·ط£ ظپظٹ ط§ظ„ط¨ظٹط§ظ†ط§طھ:\n' + validation.errors.join('\n');
        if (typeof notifications !== 'undefined') {
          notifications.error(errorMsg.replace(/\n/g, ' - '));
        } else {
          alert(errorMsg);
        }
        return;
      }
      
      try{
        
        
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          obj._id = genId();
          agents.push(obj);
          saveToStorage();
          renderTable();
          closeModal(modalAdd);
          return;
        }
        
        const insertData = {
          name: String(obj.name || ''),
          note: String(obj.note || ''),
          contract_date: String(obj.contract_date || ''),
          phase: String(obj.phase || ''),
          total_users: Number(obj.total_users || 0),
          reached_total: Number(obj.reached_total || 0),
          active: Number(obj.active || 0),
          prev_active: Number(obj.prev_active || 0)
        };
        
        if (obj.itpc_site !== undefined) {
          insertData.site = String(obj.itpc_site || '');
        }
        if (obj.fdt !== undefined) {
          insertData.fdt = String(obj.fdt || '');
        }
        if (obj.board_name !== undefined) {
          insertData.board_name = String(obj.board_name || '');
        }
        if (obj.phone !== undefined) {
          insertData.phone = String(obj.phone || '');
        }
        
        
        
        
        if (insertData.hasOwnProperty('board_name')) {
          
        } else {
        }
        
        
        
        const { data, error } = await supabase
          .from('agents')
          .insert(insertData)
          .select('*')
          .single();
          
        if(error){
          
          if (error.message && (error.message.includes('board_name') || error.message.includes('site') || error.message.includes('fdt') || error.message.includes('phone') || error.message.includes('column'))) {
            const insertDataMinimal = {
              name: String(obj.name || ''),
              note: String(obj.note || ''),
              contract_date: String(obj.contract_date || ''),
              phase: String(obj.phase || ''),
              total_users: Number(obj.total_users || 0),
              reached_total: Number(obj.reached_total || 0),
              active: Number(obj.active || 0),
              prev_active: Number(obj.prev_active || 0)
            };
            
            const { data: retryData, error: retryError } = await supabase
              .from('agents')
              .insert(insertDataMinimal)
              .select('*')
              .single();
              
            if (retryError) {
              obj._id = genId();
              agents.push(obj);
              
            } else {
              
              obj._id = genId();
              obj.db_id = retryData.id;
              dbIdByLocalId.set(obj._id, retryData.id);
              localIdByDbId.set(retryData.id, obj._id);
              agents.push(obj);
            }
          } else {
            let errorMessage = 'ظپط´ظ„ ظپظٹ ط­ظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ ظپظٹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ';
            if (error.message) errorMessage += ': ' + error.message;
            if (error.details) errorMessage += ' (ط§ظ„طھظپط§طµظٹظ„: ' + error.details + ')';
            if (error.hint) errorMessage += ' - ظ†طµظٹط­ط©: ' + error.hint;
            
            if (typeof notifications !== 'undefined') {
              notifications.error(errorMessage);
            } else {
              alert(errorMessage);
            }
            
            obj._id = genId();
            agents.push(obj);
            
          }
        } else {
          
          obj._id = genId();
          obj.db_id = data.id;
          dbIdByLocalId.set(obj._id, data.id);
          localIdByDbId.set(data.id, obj._id);
          agents.push(obj);
        }
      }catch(e){ 
        obj._id = genId();
        agents.push(obj);
      }
      
      saveToStorage();
      renderTable();
      
      closeModal(modalAdd);
      document.getElementById('new_name').value='';
      document.getElementById('new_date').value='';
      document.getElementById('new_site').value='';
      document.getElementById('new_fdt').value='';
      document.getElementById('new_note').value='';
      document.getElementById('new_phone').value='';
      document.getElementById('new_total').value='';
      document.getElementById('new_reached_total').value='';
      document.getElementById('new_active').value='';
      
      
      
      
    });

    function saveToStorage(){
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
        localStorage.setItem(STORAGE_KEY + '_timestamp', Date.now().toString());
        
        return true;
      } catch (error) {
        return false;
      }
    }
    function loadFromStorage(){
      try{
        const s = localStorage.getItem(STORAGE_KEY);
        if(!s) {
          const allKeys = Object.keys(localStorage);
          const relatedKeys = allKeys.filter(key => key.includes('agents') || key.includes('dashboard'));
          return null;
        }
        const arr = JSON.parse(s);
        if(!Array.isArray(arr)) {
          return null;
        }
        if(arr.length === 0) {
          return null;
        }
        arr.forEach(a => {
          computeAgent(a);
       
          if(a.db_id) {
            dbIdByLocalId.set(a._id, a.db_id);
            localIdByDbId.set(a.db_id, a._id);
          }
        });
        return arr;
      }catch(e){ 
        return null; 
      }
    }

    function computeAll(){
      agents.forEach(a=>computeAgent(a));
      renderTable();
    }


    async function loadFromSupabase(){
      try {
        
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }
        
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('id', { ascending: true });

        if(error){
          throw error;
        }

        if(!data || data.length === 0){
          agents = [];
          computeAll();
          return;
        }

        
        agents = data.map(row=>{
          const obj = {
            _id: genId(),
            db_id: row.id,
            name: row.name,
            note: row.note,
            contract_date: row.contract_date,
            phase: row.phase,
            itpc_site: row.site || row.itpc_site || '', 
            fdt: row.fdt || '',
            board_name: row.board_name || '', 
            phone: row.phone || '',
            total_users: row.total_users,
            reached_total: row.reached_total || row.active || 0,
            active: row.active, 
            prev_active: row.prev_active || 0,
            history: []
          };
          
          dbIdByLocalId.set(obj._id, row.id);
          localIdByDbId.set(row.id, obj._id);
          
          return computeAgent(obj);
        });
        
        saveToStorage();
        
        computeAll();
        
      } catch(e) {
        throw e; 
      }
    }

    phaseFilter.addEventListener('change', renderTable);
    searchBox.addEventListener('input', renderTable);
    sortBy.addEventListener('change', renderTable);

    function safeNum(x){ return Number(x||0) || 0; }

    
    async function initializeData() {
      try {
        updateConnectionStatus('connecting');
        
        let connectionOk = await testSupabaseConnection();
        
        if (!connectionOk && !SupabaseManager.hasInstance()) {
          updateConnectionStatus('connecting');
          reinitializeSupabase();
          connectionOk = await testSupabaseConnection();
        } else if (!connectionOk) {
        }
        
        if (connectionOk || SupabaseManager.hasInstance()) {
          try {
            await loadFromSupabase();
            return;
          } catch (e) {
          }
        }
        
        updateConnectionStatus('error');
        const localData = loadFromStorage();
        if (localData && localData.length > 0) {
          agents = localData;
        } else {
          agents = [];
        }
        computeAll();
      } catch (e) {
        const localData = loadFromStorage();
        if (localData && localData.length > 0) {
          agents = localData;
        } else {
          agents = [];
        }
        computeAll();
      }
    }
    
    function initializeSupabase() {
      
      const client = getSupabaseClient();
      if (client) {
        
        return true;
      } else {
        return false;
      }
    }

    window.addEventListener('beforeunload', function() {
      
      SupabaseManager.reset();
    });

    
    initializeSupabase();
    initializeData();
    
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof authSystem !== 'undefined') {
        authSystem.updateUI();
      }
    });
    
    function applyTheme(theme){
      const html = document.documentElement;
      btnTheme.textContent = '';
      if(theme === 'dark'){
        html.setAttribute('data-theme', 'dark');
        const moonIcon = document.createElement('span');
        moonIcon.className = 'icon';
        moonIcon.textContent = 'ًںŒ™';
        btnTheme.appendChild(moonIcon);
        btnTheme.appendChild(document.createTextNode(''));
      } else {
        html.removeAttribute('data-theme');
        const sunIcon = document.createElement('span');
        sunIcon.className = 'icon';
        sunIcon.textContent = 'âک€ï¸ڈ';
        btnTheme.appendChild(sunIcon);
        btnTheme.appendChild(document.createTextNode(''));
      }
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    btnTheme.addEventListener('click', ()=>{
      const current = localStorage.getItem('theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });


    document.addEventListener('click', (e)=>{
      if(e.target === modalEdit) {
        closeModal(modalEdit);
      }
      if(e.target === modalAdd) {
        closeModal(modalAdd);
      }
      if(e.target === modalEditInfo) {
        closeModal(modalEditInfo);
      }
    });


    const STORAGE_KEY_NOTIFICATIONS = 'agents_notifications_v1';
    
    let agentNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
    
    function saveNotifications() {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(agentNotifications));
    }
    
    function getUniqueITPCSites() {
      const sites = new Set();
      
      agents.forEach(a => {
        let site = '';
        if (a.itpc_site && a.itpc_site.trim()) {
          site = a.itpc_site.trim();
        } 
        else if (a.note && a.note.trim()) {
          const noteText = a.note.trim();
          
          const patterns = [
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)$/i,
            /([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)/i,
            /(?:ITPC|itpc)[\s:]*Site[\s:]*([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /(?:ITPC|itpc)[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /Site[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+)$/i
          ];
          
          for (const pattern of patterns) {
            const noteMatch = noteText.match(pattern);
            if (noteMatch && noteMatch[1]) {
              site = noteMatch[1].trim();
              site = site.replace(/^(ITPC|itpc|Site|site)[\s:]*/i, '').trim();
              site = site.replace(/\s+(?:ITPC|itpc)$/i, '').trim();
              if (site && site.length > 0 && site.length < 50) { 
                break;
              }
            }
          }
        }
        
        if (site) {
          sites.add(site);
        } else {
        }
      });
      
      const sitesArray = Array.from(sites).sort();
      return sitesArray;
    }
    
    function getAgentsByITPCSite(site) {
      const targetSite = site.trim();
      
      return agents.filter(a => {
        let agentSite = '';
        if (a.itpc_site && a.itpc_site.trim()) {
          agentSite = a.itpc_site.trim();
        } 
        else if (a.note && a.note.trim()) {
          const noteText = a.note.trim();
          const patterns = [
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)$/i,
            /([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)/i,
            /(?:ITPC|itpc)[\s:]*Site[\s:]*([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /(?:ITPC|itpc)[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /Site[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+)$/i
          ];
          
          for (const pattern of patterns) {
            const noteMatch = noteText.match(pattern);
            if (noteMatch && noteMatch[1]) {
              agentSite = noteMatch[1].trim();
              agentSite = agentSite.replace(/^(ITPC|itpc|Site|site)[\s:]*/i, '').trim();
              agentSite = agentSite.replace(/\s+(?:ITPC|itpc)$/i, '').trim();
              if (agentSite && agentSite.length > 0 && agentSite.length < 50) {
                break;
              }
            }
          }
        }
        
        const matches = agentSite && agentSite.toLowerCase() === targetSite.toLowerCase();
        return matches;
      });
    }
    
    function getAllAgents() {
      return agents.slice();
    }
    
    function sendNotificationToAgents(agentIds, message) {
      const timestamp = new Date().toISOString();
      agentIds.forEach(agentId => {
        agentNotifications.push({
          id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          agentId: agentId,
          message: message,
          timestamp: timestamp,
          read: false
        });
      });
      saveNotifications();
      updateNotificationBadge();
    }
    
    function updateNotificationBadge() {
      const unreadCount = agentNotifications.filter(n => !n.read).length;
      const btn = document.getElementById('btnNotifications');
      if (btn) {
        if (unreadCount > 0) {
          btn.classList.add('has-notifications');
          btn.title = `${unreadCount} ط¥ط´ط¹ط§ط± ط؛ظٹط± ظ…ظ‚ط±ظˆط،`;
        } else {
          btn.classList.remove('has-notifications');
          btn.title = 'ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ';
        }
      }
    }
    
    function renderNotificationGroups() {
      const select = document.getElementById('notificationGroup');
      const groupsList = document.getElementById('agentGroupsList');
      
      if (!select || !groupsList) {
        return;
      }
      
      const newSelect = select.cloneNode(true);
      select.parentNode.replaceChild(newSelect, select);
      
      newSelect.innerHTML = '<option value="">-- ط§ط®طھط± ITPC Site --</option>';
      newSelect.innerHTML += '<option value="ALL">ط¬ظ…ظٹط¹ ط§ظ„ظˆظƒظ„ط§ط،</option>';
      
      const sites = getUniqueITPCSites();
      
      if (sites.length > 0) {
        sites.forEach(site => {
          const option = document.createElement('option');
          option.value = site;
          const siteAgents = getAgentsByITPCSite(site);
          option.textContent = `${site} (${siteAgents.length} ظˆظƒظٹظ„)`;
          newSelect.appendChild(option);
        });
      } else {
        const debugOption = document.createElement('option');
        debugOption.value = 'DEBUG';
        debugOption.textContent = `[DEBUG] ظ„ط§ طھظˆط¬ط¯ ظ…ظˆط§ظ‚ط¹ - ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظˆظƒظ„ط§ط،: ${agents.length}`;
        newSelect.appendChild(debugOption);
      }
      
      groupsList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);"><div style="font-size:16px; margin-bottom:8px;">ًں‘†</div><div>ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ITPC Site ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط£ط¹ظ„ط§ظ‡</div></div>';
      updateSelectedCount();
      
      newSelect.addEventListener('change', (e) => {
        const selectedSite = e.target.value;
        groupsList.innerHTML = '';
        
        if (!selectedSite || selectedSite === '') {
          groupsList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);"><div style="font-size:16px; margin-bottom:8px;">ًں‘†</div><div>ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ITPC Site ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط£ط¹ظ„ط§ظ‡</div></div>';
          updateSelectedCount();
          return;
        }
        
        if (selectedSite === 'ALL') {
          displayAgentsBySite(groupsList);
          return;
        }
        
        if (selectedSite === 'DEBUG') {
          groupsList.innerHTML = '';
          const debugHeader = document.createElement('div');
          debugHeader.style.cssText = 'font-weight:700; font-size:16px; padding:16px; background:var(--warning); color:white; border-radius:8px; margin-bottom:12px; text-align:center;';
          debugHeader.innerHTML = `ًں”چ ظˆط¶ط¹ DEBUG - ط¬ظ…ظٹط¹ ط§ظ„ظˆظƒظ„ط§ط، (${agents.length})`;
          groupsList.appendChild(debugHeader);
          
          agents.forEach(agent => {
            const item = createAgentItem(agent);
            const debugInfo = document.createElement('div');
            debugInfo.style.cssText = 'font-size:10px; color:var(--text-tertiary); margin-top:4px;';
            debugInfo.innerHTML = `itpc_site: "${agent.itpc_site || '(ظپط§ط±ط؛)'}" | note: "${agent.note || '(ظپط§ط±ط؛)'}"`;
            item.appendChild(debugInfo);
            groupsList.appendChild(item);
          });
          updateSelectedCount();
          return;
        }
        
        const siteAgents = getAgentsByITPCSite(selectedSite);
        if (siteAgents.length === 0) {
          groupsList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط، ظپظٹ ظ‡ط°ط§ ط§ظ„ظ…ظˆظ‚ط¹</div>';
          updateSelectedCount();
          return;
        }
        
        const siteHeader = document.createElement('div');
        siteHeader.style.cssText = 'font-weight:700; font-size:16px; padding:16px; background:var(--primary-color); color:white; border-radius:8px; margin-bottom:12px; text-align:center;';
        siteHeader.innerHTML = `ًں“چ ${selectedSite}<br><small style="font-size:12px; opacity:0.9;">${siteAgents.length} ظˆظƒظٹظ„</small>`;
        groupsList.appendChild(siteHeader);
        
        siteAgents.forEach(agent => {
          const item = createAgentItem(agent);
          groupsList.appendChild(item);
        });
        updateSelectedCount();
      });
    }
    
    function displayAgentsBySite(container) {
      container.innerHTML = '';
      
      if (agents.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط،</div>';
        updateSelectedCount();
        return;
      }
      
      const agentsBySite = {};
      const agentsWithoutSite = [];
      
      agents.forEach(agent => {
        let site = '';
        if (agent.itpc_site && agent.itpc_site.trim()) {
          site = agent.itpc_site.trim();
        } 
        else if (agent.note && agent.note.trim()) {
          const noteText = agent.note.trim();
        
          const patterns = [
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)$/i,
            /([A-Za-z0-9][A-Za-z0-9\s\-_]+?)\s+(?:ITPC|itpc)/i,
            /(?:ITPC|itpc)[\s:]*Site[\s:]*([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /(?:ITPC|itpc)[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /Site[\s:]+([A-Za-z0-9][A-Za-z0-9\s\-_]+)/i,
            /^([A-Za-z0-9][A-Za-z0-9\s\-_]+)$/i
          ];
          
          for (const pattern of patterns) {
            const noteMatch = noteText.match(pattern);
            if (noteMatch && noteMatch[1]) {
              site = noteMatch[1].trim();
              site = site.replace(/^(ITPC|itpc|Site|site)[\s:]*/i, '').trim();
              site = site.replace(/\s+(?:ITPC|itpc)$/i, '').trim();
              if (site && site.length > 0 && site.length < 50) {
                break;
              }
            }
          }
        }
        
        if (!site || site === '') {
          agentsWithoutSite.push(agent);
        } else {
          if (!agentsBySite[site]) {
            agentsBySite[site] = [];
          }
          agentsBySite[site].push(agent);
        }
      });
      
      const sortedSites = Object.keys(agentsBySite).sort();
      sortedSites.forEach(site => {
        const siteHeader = document.createElement('div');
        siteHeader.style.cssText = 'font-weight:700; font-size:14px; padding:12px; background:var(--bg-tertiary); border-radius:8px; margin-top:12px; margin-bottom:8px; color:var(--text-primary); border:1px solid var(--border-color);';
        siteHeader.textContent = `ًں“چ ${site} (${agentsBySite[site].length} ظˆظƒظٹظ„)`;
        container.appendChild(siteHeader);
        
        agentsBySite[site].forEach(agent => {
          const item = createAgentItem(agent);
          container.appendChild(item);
        });
      });
      
      if (agentsWithoutSite.length > 0) {
        const siteHeader = document.createElement('div');
        siteHeader.style.cssText = 'font-weight:700; font-size:14px; padding:12px; background:var(--bg-tertiary); border-radius:8px; margin-top:12px; margin-bottom:8px; color:var(--text-primary); border:1px solid var(--border-color);';
        siteHeader.textContent = `ًں“چ ط¨ط¯ظˆظ† ظ…ظˆظ‚ط¹ (${agentsWithoutSite.length} ظˆظƒظٹظ„)`;
        container.appendChild(siteHeader);
        
        agentsWithoutSite.forEach(agent => {
          const item = createAgentItem(agent);
          container.appendChild(item);
        });
      }
      
      updateSelectedCount();
    }
    
    function displayAllAgents(container) {
      container.innerHTML = '';
      
      if (agents.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط،</div>';
        updateSelectedCount();
        return;
      }
      
      agents.forEach(agent => {
        const item = createAgentItem(agent);
        container.appendChild(item);
      });
      updateSelectedCount();
    }
    
    function updateSelectedCount() {
      const selectedItems = document.querySelectorAll('.agent-group-item.selected');
      const countEl = document.getElementById('selectedCount');
      if (countEl) {
        countEl.textContent = `${selectedItems.length} ظˆظƒظٹظ„ ظ…ط­ط¯ط¯`;
      }
    }
    
    function createAgentItem(agent) {
      const item = document.createElement('div');
      item.className = 'agent-group-item';
      let phoneInfo = '';
      if (agent.phone) {
        const phones = agent.phone.split(',').map(p => p.trim()).filter(p => p);
        if (phones.length > 0) {
          phoneInfo = `<br><small style="color:var(--info);">ًں“‍ ${phones.map(p => escapeHtml(p)).join(' | ')}</small>`;
        }
      }
      item.innerHTML = `
        <strong>${escapeHtml(agent.name || '---')}</strong>
        ${phoneInfo}
      `;
      item.dataset.agentId = agent._id;
      item.addEventListener('click', () => {
        item.classList.toggle('selected');
        updateSelectedCount();
      });
      return item;
    }
    
    async function sendWhatsAppToSingleAgent(phone, agentName, message) {
      if (!phone || phone.length < 12) {
        return false;
      }
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      if (!whatsappUrl.includes('wa.me/') || whatsappUrl.split('wa.me/')[1].split('?')[0].length < 12) {
        return false;
      }
      
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      try {
        link.click();
        setTimeout(() => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        }, 100);
        return true;
      } catch (error) {
        try {
          const newWindow = window.open(whatsappUrl, '_blank');
          setTimeout(() => {
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
          }, 100);
          return !!newWindow;
        } catch (e) {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
          return false;
        }
      }
    }

    async function sendWhatsAppNotificationAuto(affectedAgents, message) {
      if (!affectedAgents || affectedAgents.length === 0) {
        return { sent: 0, failed: 0 };
      }
      
      const phoneMap = new Map();
      affectedAgents.forEach(agent => {
        if (agent.phone) {
          const phones = agent.phone.split(',').map(p => p.trim()).filter(p => p);
          phones.forEach(phone => {
            const formattedPhone = formatPhoneForWhatsApp(phone);
            if (formattedPhone && !phoneMap.has(formattedPhone)) {
              phoneMap.set(formattedPhone, {
                phone: formattedPhone,
                agentName: agent.name,
                originalPhone: phone
              });
            }
          });
        }
      });
      
      const phoneNumbers = Array.from(phoneMap.values());
      
      if (phoneNumbers.length === 0) {
        return { sent: 0, failed: 0 };
      }
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < phoneNumbers.length; i++) {
        const phoneData = phoneNumbers[i];
        
        setTimeout(() => {
          sendWhatsAppToSingleAgent(phoneData.phone, phoneData.agentName, message).then(success => {
            if (success) {
              sentCount++;
            } else {
              failedCount++;
            }
          });
        }, i * 150);
      }
      
      return { sent: phoneNumbers.length, failed: 0 };
    }

    document.getElementById('btnNotifications')?.addEventListener('click', () => {
      if (agents.length === 0) {
        if (typeof notifications !== 'undefined') {
          notifications.warning('ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط، ظپظٹ ط§ظ„ظ†ط¸ط§ظ…');
        } else {
          alert('ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط، ظپظٹ ط§ظ„ظ†ط¸ط§ظ…');
        }
        return;
      }
      renderNotificationGroups();
      document.getElementById('modalNotifications').classList.add('open');
      positionModal(document.getElementById('modalNotifications'));
    });
    
    document.getElementById('closeNotificationsModal')?.addEventListener('click', () => {
      document.getElementById('notificationMessage').value = '';
      document.getElementById('notificationGroup').value = '';
      document.getElementById('agentGroupsList').innerHTML = '';
      updateSelectedCount();
      closeModal(document.getElementById('modalNotifications'));
    });
    
    let isSending = false;
    let shouldStopSending = false;
    let sendingInterval = null;
    
    function formatPhoneForWhatsApp(phone) {
      if (!phone) return null;
      
      let cleaned = phone.toString().replace(/[^0-9]/g, '');
      
      if (!cleaned || cleaned.length === 0) {
        return null;
      }
      
      if (cleaned.length < 9) {
        return null;
      }
      
      if (cleaned.startsWith('0')) {
        cleaned = '964' + cleaned.substring(1);
      }
      else if (!cleaned.startsWith('964')) {
        cleaned = '964' + cleaned;
      }
      
      if (cleaned.length < 12 || cleaned.length > 15) {
        return null;
      }
      
      return cleaned;
    }
    
    document.getElementById('sendNotification')?.addEventListener('click', async () => {
      const message = document.getElementById('notificationMessage').value.trim();
      if (!message) {
        if (typeof notifications !== 'undefined') {
          notifications.warning('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©');
        } else {
          alert('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©');
        }
        return;
      }
      
      const selectedSite = document.getElementById('notificationGroup').value;
      const selectedItems = document.querySelectorAll('.agent-group-item.selected');
      
      let selectedAgents = [];
      
      if (selectedItems.length > 0) {
        const agentIds = Array.from(selectedItems).map(item => item.dataset.agentId).filter(id => id);
        selectedAgents = agents.filter(a => agentIds.includes(a._id));
      } 
      else if (selectedSite && selectedSite !== '' && selectedSite !== 'DEBUG') {
        if (selectedSite === 'ALL') {
          selectedAgents = getAllAgents();
        } else {
          selectedAgents = getAgentsByITPCSite(selectedSite);
        }
      }
      else {
        if (typeof notifications !== 'undefined') {
          notifications.warning('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ITPC Site ط£ظˆ طھط­ط¯ظٹط¯ ظˆظƒظ„ط§ط، ط£ظˆظ„ط§ظ‹');
        } else {
          alert('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ITPC Site ط£ظˆ طھط­ط¯ظٹط¯ ظˆظƒظ„ط§ط، ط£ظˆظ„ط§ظ‹');
        }
        return;
      }
      
      if (selectedAgents.length === 0) {
        if (typeof notifications !== 'undefined') {
          notifications.warning('ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط، ظ„ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط© ط¥ظ„ظٹظ‡ظ…');
        } else {
          alert('ظ„ط§ ظٹظˆط¬ط¯ ظˆظƒظ„ط§ط، ظ„ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط© ط¥ظ„ظٹظ‡ظ…');
        }
        return;
      }
      
      const phoneMap = new Map();
      selectedAgents.forEach(agent => {
        if (agent.phone) {
          const phones = agent.phone.split(',').map(p => p.trim()).filter(p => p);
          phones.forEach(phone => {
            const formattedPhone = formatPhoneForWhatsApp(phone);
            if (formattedPhone && !phoneMap.has(formattedPhone)) {
              phoneMap.set(formattedPhone, {
                phone: formattedPhone,
                agentName: agent.name,
                originalPhone: phone
              });
            }
          });
        }
      });
      
      const phoneNumbers = Array.from(phoneMap.values());
      
      if (phoneNumbers.length === 0) {
        if (typeof notifications !== 'undefined') {
          notifications.error('ظ„ط§ طھظˆط¬ط¯ ط£ط±ظ‚ط§ظ… ظ‡ظˆط§طھظپ طµط­ظٹط­ط© ظ„ظ„ظˆظƒظ„ط§ط، ط§ظ„ظ…ط­ط¯ط¯ظٹظ†');
        } else {
          alert('ظ„ط§ طھظˆط¬ط¯ ط£ط±ظ‚ط§ظ… ظ‡ظˆط§طھظپ طµط­ظٹط­ط© ظ„ظ„ظˆظƒظ„ط§ط، ط§ظ„ظ…ط­ط¯ط¯ظٹظ†');
        }
        return;
      }
      
      isSending = true;
      shouldStopSending = false;
      const sendBtn = document.getElementById('sendNotification');
      const progressDiv = document.getElementById('sendingProgress');
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progressText');
      const progressStats = document.getElementById('progressStats');
      const progressDetails = document.getElementById('progressDetails');
      const stopBtn = document.getElementById('stopSending');
      
      const originalText = sendBtn.textContent;
      sendBtn.disabled = true;
      sendBtn.textContent = 'ط¬ط§ط±ظٹ ط§ظ„ط¥ط±ط³ط§ظ„...';
      
      progressDiv.style.display = 'block';
      stopBtn.style.display = 'none';
      
      try {
        let sentCount = 0;
        let failedCount = 0;
        const startTime = Date.now();
        
        for (let i = 0; i < phoneNumbers.length; i++) {
          const phoneData = phoneNumbers[i];
          
          setTimeout(() => {
            if (!shouldStopSending) {
              sendWhatsAppToSingleAgent(phoneData.phone, phoneData.agentName, message).then(success => {
                if (success) {
                  sentCount++;
                } else {
                  failedCount++;
                }
                
                const progress = ((sentCount + failedCount) / phoneNumbers.length) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = `ط¬ط§ط±ظٹ ط§ظ„ط¥ط±ط³ط§ظ„... (${sentCount + failedCount}/${phoneNumbers.length})`;
                progressDetails.textContent = `${phoneData.agentName} - ${phoneData.originalPhone}`;
                
                if (sentCount + failedCount === phoneNumbers.length) {
                  selectedAgents.forEach(agent => {
                    sendNotificationToAgents([agent._id], message);
                  });
                  
                  const endTime = Date.now();
                  const totalTime = Math.round((endTime - startTime) / 1000);
                  
                  progressBar.style.width = '100%';
                  progressText.textContent = 'ط§ظƒطھظ…ظ„ ط§ظ„ط¥ط±ط³ط§ظ„';
                  progressDetails.textContent = `طھظ… ظپطھط­ ${sentCount} ظ†ط§ظپط°ط© ظˆط§طھط³ط§ط¨${failedCount > 0 ? ` (ظپط´ظ„: ${failedCount})` : ''}`;
                  
                  setTimeout(() => {
                    document.getElementById('notificationMessage').value = '';
                    document.getElementById('notificationGroup').value = '';
                    document.getElementById('agentGroupsList').innerHTML = '';
                    updateSelectedCount();
                    progressDiv.style.display = 'none';
                    closeModal(document.getElementById('modalNotifications'));
                    sendBtn.disabled = false;
                    sendBtn.textContent = originalText;
                    isSending = false;
                  }, 2000);
                }
              });
            }
          }, i * 150);
        }
        
      } catch (error) {
        progressText.textContent = 'â‌Œ ط­ط¯ط« ط®ط·ط£';
        progressDetails.textContent = 'ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط¥ط±ط³ط§ظ„. ظٹط±ط¬ظ‰ ط§ظ„ظ…ط­ط§ظˆظ„ط© ظ…ط±ط© ط£ط®ط±ظ‰.';
      } finally {
        isSending = false;
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        stopBtn.style.display = 'none';
      }
    });
    
    document.getElementById('stopSending')?.addEventListener('click', () => {
      if (confirm('ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط¥ظٹظ‚ط§ظپ ط§ظ„ط¥ط±ط³ط§ظ„طں')) {
        shouldStopSending = true;
        document.getElementById('stopSending').disabled = true;
        document.getElementById('stopSending').textContent = 'ط¬ط§ط±ظٹ ط§ظ„ط¥ظٹظ‚ط§ظپ...';
      }
    });
    
    document.addEventListener('DOMContentLoaded', () => {
      updateNotificationBadge();
    });

    document.getElementById('btnWeeklyReport').addEventListener('click', ()=>{
      const todayStr = toYMDLocal(new Date());
      const headers = ['ط§ظ„ظˆظƒظٹظ„','طھط§ط±ظٹط® ط§ظ„ط¹ظ‚ط¯','طھط§ط±ظٹط® ط§ظ„ظٹظˆظ…','FDT',' ط§ظ„ظ„ظˆط­ط©','ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†','ط§ظ„ط¹ط¯ط¯ ط§ظ„ظپط¹ظ„ظٹ','ط§ظ„ظ†ط´ط· ط§ظ„ط­ط§ظ„ظٹ','ط§ظ„ظ…ظ†طھظ‡ظٹ ط§ط´طھط±ط§ظƒظ‡ظ…','ط§ظ„ظ†ظ…ظˆ ط§ظ„ط£ط³ط¨ظˆط¹ظٹ','ظ…ط¹ط¯ظ„ ط§ظ„طھظپط¹ظٹظ„','ط§ظ„ظ†ط³ط¨ط© ط§ظ„ظ…ط·ظ„ظˆط¨ط©','ط§ظ„ظ…ط·ظ„ظˆط¨ ظ„ظ„ظˆطµظˆظ„','ظ†ط³ط¨ط© ط§ظ„ط¹ط¬ط²','ط¹ط¯ط¯ ط§ظ„ط¹ط¬ط²'];

      const PHASE_ORDER = ['OLD','PHASE2','PHASE3'];
      let list = agents.slice();
      const sort = (document.getElementById('sortBy')||{}).value || 'name';
      if(sort === 'total_users_desc') list.sort((a,b)=> b.total_users - a.total_users);
      else if(sort === 'active_desc') list.sort((a,b)=> b.active - a.active);
      else if(sort === 'deficit_desc') list.sort((a,b)=> b.deficit_users - a.deficit_users);
      else list.sort((a,b)=> (a.name||'').localeCompare(b.name||'', 'ar'));

      const phaseToItems = {};
      list.forEach(a=>{
        const key = (a.phase||'').toUpperCase();
        if(!phaseToItems[key]) phaseToItems[key] = [];
        phaseToItems[key].push(a);
      });

      let html = '';
      html += `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>طھظ‚ط±ظٹط± ظ…طھط§ط¨ط¹ط© ط§ظ„ظˆظƒظ„ط§ط،</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { 
      width: 100%; 
      min-height: 100vh; 
      margin: 0; 
      padding: 0; 
      font-family: "Arial", "Helvetica", sans-serif;
      color: #000;
      overflow: auto;
    }
    @page { 
      size: A4 landscape; 
      margin: 5mm; 
    }
    table { 
      width: 100%; 
      max-width: 100%;
      border-collapse: collapse; 
      table-layout: fixed; 
      font-size: 8px; 
      font-weight: bold;
      margin: 0;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 2px 3px; 
      text-align: center; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    th { 
      background: #000; 
      color: #fff; 
      font-weight: bold;
      font-size: 8px;
      height: 25px;
      line-height: 1.2;
      white-space: normal;
      word-wrap: break-word;
    }
    td:nth-child(1) { 
      text-align: right; 
      width: 8%;
    }
    td:nth-child(2), td:nth-child(3) { 
      width: 4.5%;
    }
    td:nth-child(4) { 
      width: 5%;
    }
    td:nth-child(5) { 
      width: 4.5%;
    }
    td:nth-child(6) { 
      width: 5.5%;
    }
    td:nth-child(7) { 
      width: 5.5%;
    }
    td:nth-child(8) { 
      width: 5.5%;
    }
    td:nth-child(9) { 
      width: 5.5%;
    }
    td:nth-child(10) { 
      width: 5.5%;
    }
    td:nth-child(11) { 
      width: 5.5%;
    }
    td:nth-child(12) { 
      width: 4.5%;
    }
    td:nth-child(13) { 
      width: 5.5%;
    }
    td:nth-child(14) { 
      width: 5.5%;
    }
    td:nth-child(15) { 
      width: 5.5%;
    }
    tr.phase-row td { 
      background: #d0d0d0; 
      font-weight: bold; 
      text-align: right; 
      color: #000;
      font-size: 10px;
      height: 20px;
      border: none;
    }
    
    tr.phase-row td:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    
    tr.phase-row td:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    tr.subtotal-title td { 
      background: #c0c0c0; 
      font-weight: bold; 
      text-align: right; 
      color: #000;
      height: 18px;
      border: none;
    }
    
    tr.subtotal-title td:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    
    tr.subtotal-title td:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    tr.subtotal-values td { 
      background: #e0e0e0; 
      font-weight: bold; 
      color: #000;
      height: 16px;
      border: none;
    }
    
    tr.subtotal-values td:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    
    tr.subtotal-values td:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    tr.grand-total td { 
      background: #a0a0a0; 
      font-weight: bold; 
      color: #000;
      height: 18px;
      border: none;
    }
    
    tr.grand-total td:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    
    :root:not([data-theme="dark"]) tr.phase-row td { 
      background: #e2e8f0; 
      color: #333333;
    }
    
    :root:not([data-theme="dark"]) tr.subtotal-title td { 
      background: #cbd5e1; 
      color: #333333;
    }
    
    :root:not([data-theme="dark"]) tr.subtotal-values td { 
      background: #f1f5f9; 
      color: #333333;
    }
    
    :root:not([data-theme="dark"]) tr.grand-total td { 
      background: #94a3b8; 
      color: #333333;
    }
    .left { text-align: right; }
    @media print { 
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body { 
        width: 100% !important;
        min-height: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: "Arial", "Helvetica", sans-serif !important;
        color: #000 !important;
        position: relative !important;
        overflow: visible !important;
      } 
      table {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        font-size: 8px !important;
        font-weight: bold !important;
        border-collapse: collapse !important;
        margin: 0 !important;
        padding: 0 !important;
        table-layout: fixed !important;
      }
      th, td {
        padding: 2px 3px !important;
        font-size: 8px !important;
        font-weight: bold !important;
        border: 1px solid #000 !important;
        color: #000 !important;
        vertical-align: middle !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      td:nth-child(1) { width: 8% !important; text-align: right !important; }
      td:nth-child(2), td:nth-child(3) { width: 4.5% !important; }
      td:nth-child(4) { width: 5% !important; }
      td:nth-child(5) { width: 4.5% !important; }
      td:nth-child(6) { width: 5.5% !important; }
      td:nth-child(7) { width: 5.5% !important; }
      td:nth-child(8) { width: 5.5% !important; }
      td:nth-child(9) { width: 5.5% !important; }
      td:nth-child(10) { width: 5.5% !important; }
      td:nth-child(11) { width: 5.5% !important; }
      td:nth-child(12) { width: 4.5% !important; }
      td:nth-child(13) { width: 5.5% !important; }
      td:nth-child(14) { width: 5.5% !important; }
      td:nth-child(15) { width: 5.5% !important; }
      
      td:nth-child(4), td:nth-child(5) {
        white-space: normal !important;
        word-wrap: break-word !important;
        overflow: visible !important;
        text-overflow: unset !important;
      }
      th {
        font-size: 8px !important;
        height: 25px !important;
        background: #000 !important;
        color: #fff !important;
        font-weight: bold !important;
        text-align: center !important;
        vertical-align: middle !important;
        white-space: normal !important;
        line-height: 1.2 !important;
        padding: 3px 2px !important;
        word-wrap: break-word !important;
      }
      tr.phase-row td {
        height: 20px !important;
        font-size: 10px !important;
        background: #d0d0d0 !important;
        color: #000 !important;
      }
      tr.subtotal-title td {
        height: 18px !important;
        background: #c0c0c0 !important;
        color: #000 !important;
      }
      tr.subtotal-values td {
        height: 16px !important;
        background: #e0e0e0 !important;
        color: #000 !important;
      }
      tr.grand-total td {
        height: 18px !important;
        background: #a0a0a0 !important;
        color: #000 !important;
      }
      thead { display: table-header-group !important; } 
      tfoot { display: table-footer-group !important; } 
      tr, td, th { page-break-inside: avoid !important; } 
      .page-one {
        page-break-after: always !important;
        break-after: page !important;
        -webkit-page-break-after: always !important;
        height: calc(100vh - 10mm) !important;
        overflow: hidden !important;
      }
      @page {
        size: A4 landscape !important;
        margin: 5mm !important;
      }
      @page :first {
        size: A4 landscape !important;
        margin: 5mm !important;
      }
      @page :nth(2) {
        size: A4 landscape !important;
        margin: 5mm !important;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
        -webkit-page-break-before: always !important;
        page-break-after: auto !important;
        display: block !important;
        clear: both !important;
        width: 100% !important;
        min-height: calc(100vh - 40px) !important;
        margin: 0 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        position: relative !important;
        page-break-inside: avoid !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      div[style*="page-break-before"] {
        page-break-before: always !important;
        break-before: page !important;
        -webkit-page-break-before: always !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      div[style*="page-break-before: always"] {
        page-break-before: always !important;
        break-before: page !important;
        -webkit-page-break-before: always !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .page-break table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin-bottom: 20px !important;
        font-size: 9px !important;
      }
      .page-break th,
      .page-break td {
        border: 1px solid #000 !important;
        padding: 6px !important;
        text-align: center !important;
        color: #000 !important;
      }
      .page-break h2,
      .page-break h3 {
        color: #000 !important;
        font-weight: bold !important;
        page-break-after: avoid !important;
      }
      .page-break thead {
        display: table-header-group !important;
      }
      .page-break tbody {
        display: table-row-group !important;
      }
      .signature { position: fixed; bottom: 20px; left: 20px; font-size: 8px; font-weight: normal; color: #999; z-index: 9999; background: white; padding: 5px; }
      button[onclick*="print"] {
        display: none !important;
      }
    }
    @media screen {
      button[onclick*="print"] {
        display: block !important;
      }
    }
  </style>
</head>
<body>`;
      html += '<div class="page-one">';
      html += '<table><thead><tr>' + headers.map(h=>`<th>${h}</th>`).join('') + '</tr></thead><tbody>';

      let grand = { total:0, active:0, deficit_users:0, reached_total:0, expired:0 };

      PHASE_ORDER.forEach(phaseKey=>{
        const items = phaseToItems[phaseKey];
        if(!items || items.length===0) return;

        html += `<tr class=\"phase-row\"><td colspan=\"${headers.length}\" class=\"left\">${arabicPhaseLabel(phaseKey)}</td></tr>`;

        items.forEach(a=>{
          const isNew = (a.months_since || 999) < 6 || a.status === 'ط¬ط¯ظٹط¯';
          const rowStyle = isNew ? 'background-color: rgba(34, 197, 94, 0.15) !important;' : '';
          html += `<tr style="${rowStyle}">` + [
            escapeHtml(a.name || ''),
            a.contract_date || '',
            todayStr,
            a.fdt || '',
            (a.board_name || ''),
            num(a.total_users),
            num(a.reached_total || 0),
            num(a.active),
            num(a.expired || 0),
            `<span style="font-weight:700; color: ${(a.growth||0) > 0 ? '#22c55e' : (a.growth||0) < 0 ? '#ef4444' : '#000000'} !important;">${signedNum(a.growth||0)}</span>`,
            (a.required_rate === null ? (a.activation_rate||0) + '%' : `<span style="${getActivationRateColor(a.activation_rate||0, a.required_rate)}">${(a.activation_rate||0) + '%'}</span>`),
            (a.required_rate === null ? '-' : a.required_rate + '%'),
            (a.required_rate === null ? '-' : num(a.required_users)),
            (a.required_rate === null ? '-' : `<span style="${getDeficitColor(a.deficit_percent||0, a.required_rate)}">${(a.deficit_percent||0) + '%'}</span>`),
            (a.deficit_users ? `<span style="${getDeficitUsersColorForReport(a.deficit_users, a.total_users)}">${num(a.deficit_users)}</span>` : '-')
          ].map(v=>`<td>${v}</td>`).join('') + '</tr>';
        });

        const totals = items.reduce((acc, a)=>{
          acc.total += Number(a.total_users||0);
          acc.active += Number(a.active||0);
          acc.deficit_users += Number(a.deficit_users||0);
          acc.reached_total += Number(a.reached_total||0);
          acc.expired += Number(a.expired||0);
          return acc;
        }, {total:0, active:0, deficit_users:0, reached_total:0, expired:0});
        grand.total += totals.total; grand.reached_total += totals.reached_total; grand.active += totals.active; grand.expired += totals.expired; grand.deficit_users += totals.deficit_users;

        html += `<tr class=\"subtotal-title\"><td colspan=\"${headers.length}\" class=\"left\">ظ…ط¬ظ…ظˆط¹ ${arabicPhaseLabel(phaseKey)}</td></tr>`;
        const cells = new Array(headers.length).fill('');
        cells[5] = num(totals.total);
        cells[6] = num(totals.reached_total);
        cells[7] = num(totals.active);
        cells[8] = num(totals.expired);
        cells[14] = totals.deficit_users ? `<span style="${getDeficitUsersColorForReport(totals.deficit_users, totals.total)}">${num(totals.deficit_users)}</span>` : '-';
        html += '<tr class=\"subtotal-values\">' + cells.map(v=>`<td>${v}</td>`).join('') + '</tr>';
      });

      const grandCells = new Array(headers.length).fill('');
      grandCells[5] = num(grand.total);
      grandCells[6] = num(grand.reached_total);
      grandCells[7] = num(grand.active);
      grandCells[8] = num(grand.expired);
      grandCells[14] = grand.deficit_users ? `<span style="${getDeficitUsersColorForReport(grand.deficit_users, grand.total)}">${num(grand.deficit_users)}</span>` : '-';
      html += `<tr class=\"grand-total\"><td colspan=\"${headers.length}\" class=\"left\">ط§ظ„ظ…ط¬ظ…ظˆط¹ ط§ظ„ظƒظ„</td></tr>`;
      html += '<tr class=\"grand-total\">' + grandCells.map(v=>`<td>${v}</td>`).join('') + '</tr>';

      html += '</tbody></table>';
      html += '</div>';
      
      html += '<div class="page-break" style="page-break-before: always !important; break-before: page !important; -webkit-page-break-before: always !important; display: block !important; width: 100% !important; min-height: calc(100vh - 40px) !important; padding: 15px !important; box-sizing: border-box !important; position: relative !important; margin: 0 !important; margin-top: 0 !important; visibility: visible !important; opacity: 1 !important; background: white !important; page-break-inside: avoid !important; overflow: visible !important;">';
      html += '<h2 style="text-align: center; margin-bottom: 15px; color: #000; font-size: 18px; font-weight: bold; border-bottom: 3px solid #000; padding-bottom: 8px;"> </h2>';
      
      const totalGrowth = list.reduce((sum, a) => sum + (a.growth || 0), 0);
      const positiveGrowth = list.filter(a => (a.growth || 0) > 0).length;
      const negativeGrowth = list.filter(a => (a.growth || 0) < 0).length;
      const noGrowth = list.filter(a => (a.growth || 0) === 0).length;
      const overallActivation = grand.total > 0 ? ((grand.active / grand.total) * 100) : 0;
      
      const statusStats = {};
      list.forEach(agent => {
        const status = agent.status || 'ط؛ظٹط± ظ…ط­ط¯ط¯';
        if(!statusStats[status]) {
          statusStats[status] = { count: 0 };
        }
        statusStats[status].count++;
      });
      
      const phaseStats = {};
      PHASE_ORDER.forEach(phaseKey => {
        const items = phaseToItems[phaseKey];
        if(items && items.length > 0) {
          phaseStats[phaseKey] = {
            count: items.length,
            total: items.reduce((s, a) => s + (a.total_users || 0), 0),
            active: items.reduce((s, a) => s + (a.active || 0), 0)
          };
        }
      });
      
      const totalDeficit = list.reduce((sum, a) => sum + (a.deficit_users || 0), 0);
      const agentsWithDeficit = list.filter(a => (a.deficit_users || 0) > 0).length;
      const statusOrder = ['ظ…طھظپظˆظ‚', 'ظ…ط·ط§ط¨ظ‚', 'ط¬ط¯ظٹط¯', 'ط¹ط¬ط²'];
      const topAgentsByTotal = list.slice().sort((a, b) => (b.total_users || 0) - (a.total_users || 0)).slice(0, 10);
      const topAgentsByGrowth = list.slice().filter(a => (a.growth || 0) > 0).sort((a, b) => (b.growth || 0) - (a.growth || 0)).slice(0, 10);
      const topAgentsByNegativeGrowth = list.slice().filter(a => (a.growth || 0) < 0).sort((a, b) => (a.growth || 0) - (b.growth || 0)).slice(0, 10);
      const topAgentsByDeficit = list.slice().filter(a => (a.deficit_users || 0) > 0).sort((a, b) => (b.deficit_users || 0) - (a.deficit_users || 0)).slice(0, 10);
      
      html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">';
      html += '<div style="background: #f8f9fa; border: 2px solid #000; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظˆظƒظ„ط§ط،</div>';
      html += `<div style="font-size: 18px; font-weight: bold; color: #000;">${list.length}</div>`;
      html += '</div>';
      html += '<div style="background: #e8f5e9; border: 2px solid #000; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†</div>';
      html += `<div style="font-size: 18px; font-weight: bold; color: #000;">${num(grand.total)}</div>`;
      html += '</div>';
      html += '<div style="background: #e3f2fd; border: 2px solid #000; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ط§ظ„ظ†ط´ط·</div>';
      html += `<div style="font-size: 18px; font-weight: bold; color: #000;">${num(grand.active)}</div>`;
      html += '</div>';
      html += '<div style="background: #fff3e0; border: 2px solid #000; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ظ…ط¹ط¯ظ„ ط§ظ„طھظپط¹ظٹظ„</div>';
      html += `<div style="font-size: 18px; font-weight: bold; color: #000;">${overallActivation.toFixed(1)}%</div>`;
      html += '</div>';
      html += '</div>';
      
      html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">';
      html += '<div style="background: #e8f5e9; border: 2px solid #22c55e; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ط§ظ„ظ†ظ…ظˆ ط§ظ„ط£ط³ط¨ظˆط¹ظٹ</div>';
      html += `<div style="font-size: 16px; font-weight: bold; color: ${totalGrowth >= 0 ? '#22c55e' : '#ef4444'};">${signedNum(totalGrowth)}</div>`;
      html += '</div>';
      html += '<div style="background: #fff3e0; border: 2px solid #f59e0b; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ظˆظƒظ„ط§ط، ط¨ظ†ظ…ظˆ ط¥ظٹط¬ط§ط¨ظٹ</div>';
      html += `<div style="font-size: 16px; font-weight: bold; color: #000;">${positiveGrowth}</div>`;
      html += '</div>';
      html += '<div style="background: #ffebee; border: 2px solid #ef4444; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¹ط¬ط²</div>';
      html += `<div style="font-size: 16px; font-weight: bold; color: #ef4444;">${num(totalDeficit)}</div>`;
      html += '</div>';
      html += '<div style="background: #fce4ec; border: 2px solid #ef4444; padding: 10px; text-align: center; border-radius: 5px;">';
      html += '<div style="font-size: 11px; color: #666; margin-bottom: 5px;">ظˆظƒظ„ط§ط، ط¨ط¹ط¬ط²</div>';
      html += `<div style="font-size: 16px; font-weight: bold; color: #000;">${agentsWithDeficit}</div>`;
      html += '</div>';
      html += '</div>';
      
      html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px;">';
      
      html += '<div>';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold; background: #e3f2fd; padding: 6px; border: 1px solid #000;">ط£ط¹ظ„ظ‰ 10 ظˆظƒظ„ط§ط، (ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†)</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 8px;">';
      html += '<thead><tr style="background: #000; color: #fff;"><th style="padding: 4px; border: 1px solid #000;">ط§ظ„طھط±طھظٹط¨</th><th style="padding: 4px; border: 1px solid #000;">ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ط´ط·</th></tr></thead>';
      html += '<tbody>';
      topAgentsByTotal.forEach((agent, idx) => {
        html += `<tr><td style="padding: 3px; border: 1px solid #000; text-align: center;">${idx + 1}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 7px;">${escapeHtml((agent.name || '').substring(0, 18))}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center;">${num(agent.total_users)}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center;">${num(agent.active)}</td></tr>`;
      });
      html += '</tbody></table>';
      html += '</div>';
      
      html += '<div>';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold; background: #e8f5e9; padding: 6px; border: 1px solid #000;">ط£ط¹ظ„ظ‰ 10 ظˆظƒظ„ط§ط، (ط§ظ„ظ†ظ…ظˆ ط§ظ„ط£ط³ط¨ظˆط¹ظٹ)</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 8px;">';
      html += '<thead><tr style="background: #000; color: #fff;"><th style="padding: 4px; border: 1px solid #000;">ط§ظ„طھط±طھظٹط¨</th><th style="padding: 4px; border: 1px solid #000;">ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ظ…ظˆ</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ط´ط·</th></tr></thead>';
      html += '<tbody>';
      topAgentsByGrowth.forEach((agent, idx) => {
        html += `<tr><td style="padding: 3px; border: 1px solid #000; text-align: center;">${idx + 1}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 7px;">${escapeHtml((agent.name || '').substring(0, 18))}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center; color: #22c55e; font-weight: bold;">+${num(agent.growth || 0)}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center;">${num(agent.active)}</td></tr>`;
      });
      if(topAgentsByGrowth.length === 0) {
        html += '<tr><td colspan="4" style="padding: 8px; border: 1px solid #000; text-align: center;">ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ</td></tr>';
      }
      html += '</tbody></table>';
      html += '</div>';
      
      html += '<div>';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold; background: #ffebee; padding: 6px; border: 1px solid #000;">ط£ط¹ظ„ظ‰ 10 ظˆظƒظ„ط§ط، (ظ†ظ…ظˆ ط³ظ„ط¨ظٹ)</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 8px;">';
      html += '<thead><tr style="background: #000; color: #fff;"><th style="padding: 4px; border: 1px solid #000;">ط§ظ„طھط±طھظٹط¨</th><th style="padding: 4px; border: 1px solid #000;">ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ظ…ظˆ</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ط´ط·</th></tr></thead>';
      html += '<tbody>';
      topAgentsByNegativeGrowth.forEach((agent, idx) => {
        html += `<tr><td style="padding: 3px; border: 1px solid #000; text-align: center;">${idx + 1}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 7px;">${escapeHtml((agent.name || '').substring(0, 18))}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center; color: #ef4444; font-weight: bold;">${num(agent.growth || 0)}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center;">${num(agent.active)}</td></tr>`;
      });
      if(topAgentsByNegativeGrowth.length === 0) {
        html += '<tr><td colspan="4" style="padding: 8px; border: 1px solid #000; text-align: center;">ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ</td></tr>';
      }
      html += '</tbody></table>';
      html += '</div>';
      
      html += '<div>';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold; background: #ffebee; padding: 6px; border: 1px solid #000;">ط£ط¹ظ„ظ‰ 10 ظˆظƒظ„ط§ط، (ط§ظ„ط¹ط¬ط²)</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 8px;">';
      html += '<thead><tr style="background: #000; color: #fff;"><th style="padding: 4px; border: 1px solid #000;">ط§ظ„طھط±طھظٹط¨</th><th style="padding: 4px; border: 1px solid #000;">ط§ط³ظ… ط§ظ„ظˆظƒظٹظ„</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ط¹ط¬ط²</th><th style="padding: 4px; border: 1px solid #000;">ط§ظ„ظ†ط³ط¨ط©</th></tr></thead>';
      html += '<tbody>';
      topAgentsByDeficit.forEach((agent, idx) => {
        html += `<tr><td style="padding: 3px; border: 1px solid #000; text-align: center;">${idx + 1}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 7px;">${escapeHtml((agent.name || '').substring(0, 18))}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center; color: #ef4444; font-weight: bold;">${num(agent.deficit_users || 0)}</td>`;
        html += `<td style="padding: 3px; border: 1px solid #000; text-align: center;">${(agent.deficit_percent || 0).toFixed(1)}%</td></tr>`;
      });
      if(topAgentsByDeficit.length === 0) {
        html += '<tr><td colspan="4" style="padding: 8px; border: 1px solid #000; text-align: center;">ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ</td></tr>';
      }
      html += '</tbody></table>';
      html += '</div>';
      html += '</div>';
      
      html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">';
      html += '<div style="background: #f8f9fa; border: 2px solid #000; padding: 10px; border-radius: 5px;">';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold;">ط¥ط­طµط§ط¦ظٹط§طھ ط¥ط¶ط§ظپظٹط©</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 9px;">';
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ط§ظ„ط¹ط¯ط¯ ط§ظ„ظپط¹ظ„ظٹ:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center;">${num(grand.reached_total)}</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ط§ظ„ظ…ظ†طھظ‡ظٹ:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center;">${num(grand.expired)}</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظˆظƒظ„ط§ط، ط¨ظ†ظ…ظˆ ط³ظ„ط¨ظٹ:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center; color: #ef4444;">${negativeGrowth}</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظˆظƒظ„ط§ط، ط¨ط¯ظˆظ† طھط؛ظٹظٹط±:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center;">${noGrowth}</td></tr>`;
      html += '</table>';
      html += '</div>';
      html += '<div style="background: #f8f9fa; border: 2px solid #000; padding: 10px; border-radius: 5px;">';
      html += '<h4 style="text-align: center; margin-bottom: 8px; color: #000; font-size: 12px; font-weight: bold;">طھط­ظ„ظٹظ„ ط§ظ„ط£ط¯ط§ط،</h4>';
      html += '<table style="width: 100%; border-collapse: collapse; font-size: 9px;">';
      const avgGrowth = list.length > 0 ? (totalGrowth / list.length).toFixed(1) : 0;
      const avgActivation = list.filter(a => (a.total_users || 0) > 0).length > 0 ? 
        (list.filter(a => (a.total_users || 0) > 0).reduce((s, a) => s + (a.activation_rate || 0), 0) / list.filter(a => (a.total_users || 0) > 0).length).toFixed(1) : 0;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظ…طھظˆط³ط· ط§ظ„ظ†ظ…ظˆ ظ„ظƒظ„ ظˆظƒظٹظ„:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center;">${avgGrowth}</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظ…طھظˆط³ط· ظ…ط¹ط¯ظ„ ط§ظ„طھظپط¹ظٹظ„:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center;">${avgActivation}%</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظ†ط³ط¨ط© ط§ظ„ظˆظƒظ„ط§ط، ط§ظ„ظ…طھظپظˆظ‚ظٹظ†:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center; color: #10b981;">${statusStats['ظ…طھظپظˆظ‚'] ? ((statusStats['ظ…طھظپظˆظ‚'].count / list.length) * 100).toFixed(1) : 0}%</td></tr>`;
      html += `<tr><td style="padding: 4px; border: 1px solid #ccc; text-align: right; font-weight: bold;">ظ†ط³ط¨ط© ط§ظ„ظˆظƒظ„ط§ط، ط¨ط¹ط¬ط²:</td><td style="padding: 4px; border: 1px solid #ccc; text-align: center; color: #ef4444;">${list.length > 0 ? ((agentsWithDeficit / list.length) * 100).toFixed(1) : 0}%</td></tr>`;
      html += '</table>';
      html += '</div>';
      html += '</div>';
      
      html += '</div>';
      
      html += '<div style="position: fixed; top: 20px; left: 20px; z-index: 10000; display: block !important;">';
      html += '<button onclick="window.print()" style="background: #007bff; color: white; border: none; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">ًں–¨ï¸ڈ ط·ط¨ط§ط¹ط© ط§ظ„طھظ‚ط±ظٹط±</button>';
      html += '</div>';
      html += '</body>';
      html += 'window.onload = function() {';
      html += '  // ط§ظ„طھط£ظƒط¯ ظ…ظ† ط£ظ† body ظٹط³ظ…ط­ ط¨ط¹ط±ط¶ ط¬ظ…ظٹط¹ ط§ظ„طµظپط­ط§طھ';
      html += '  document.body.style.overflow = "visible";';
      html += '  document.body.style.height = "auto";';
      html += '  document.documentElement.style.overflow = "visible";';
      html += '  document.documentElement.style.height = "auto";';
      html += '  // ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ظˆط¬ظˆط¯ ط§ظ„طµظپط­ط© ط§ظ„ط«ط§ظ†ظٹط© ظˆط¥ط¬ط¨ط§ط± ط¥ط¹ط§ط¯ط© ط§ظ„ط±ط³ظ…';
      html += '  setTimeout(function(){';
      html += '    var pageBreak = document.querySelector(".page-break");';
      html += '    if(pageBreak) {';
      html += '      // ط§ظ„طھط£ظƒط¯ ظ…ظ† ط£ظ† ط§ظ„طµظپط­ط© ظ…ط±ط¦ظٹط©';
      html += '      pageBreak.style.visibility = "visible";';
      html += '      pageBreak.style.display = "block";';
      html += '      pageBreak.style.opacity = "1";';
      html += '      pageBreak.style.height = "auto";';
      html += '      pageBreak.style.minHeight = "calc(100vh - 40px)";';
      html += '    }';
      html += '  }, 200);';
      html += '};';
      html += '<\/script>';
      html += '</html>';

      const w = window.open('about:blank','_blank');
      if(w){
        w.document.open();
        const doc = w.document;
        doc.write(html);
        doc.close();
      }
    });
