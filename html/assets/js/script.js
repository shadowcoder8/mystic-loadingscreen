/*=================================================================*\
/* By:         | Nevera Development & Refactored by Jules        |
/* FiveM:      | https://forum.cfx.re/u/neveradevelopment    |
/* Discord:    | https://discord.gg/NeveraDev/tw28AqrgWU     |
/*=================================================================*/

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof AppConfig === 'undefined') {
            console.error('AppConfig not found. Make sure config.js is loaded correctly.');
            document.body.innerHTML = '<p style="color:red; font-family:sans-serif; padding:20px;">Error: AppConfig not found. Loading screen cannot initialize.</p>';
            return;
        }

        const DOM = {
            body: document.body,
            backgroundContainer: document.getElementById('background-container'),
            particlesJsContainer: document.getElementById('particles-js'),
            localVideoBg: document.getElementById('local-video-bg'),
            youtubeVideoBg: document.getElementById('youtube-video-bg'),
            serverLogo: document.getElementById('server-logo'),
            serverName: document.getElementById('server-name'),
            serverDescription: document.getElementById('server-description'),
            staffPanel: document.querySelector('.staff-panel'),
            staffList: document.querySelector('.staff-panel .staff-list'),
            playerListPanel: document.querySelector('.player-list-panel'),
            playerList: document.querySelector('.player-list-panel .player-list'),
            playerCount: document.getElementById('player-count'),
            messagesArea: document.querySelector('.messages-area'),
            tipsMessages: document.getElementById('tips-messages'),
            changelogFeed: document.getElementById('changelog-feed'),
            changelogList: document.getElementById('changelog-list'),
            socialLinksContainer: document.querySelector('.social-links'),
            progressText: document.getElementById('loading-progress-text'),
            progressBarInner: document.querySelector('.progress-bar-inner'),
            muteButton: document.getElementById('mute-button'),
            muteButtonIcon: document.getElementById('mute-button').querySelector('i'),
            pauseButton: document.getElementById('pause-button'),
            pauseButtonIcon: document.getElementById('pause-button').querySelector('i'),
            volumeSlider: document.getElementById('volume-slider'),
            volumePercentage: document.getElementById('volume-percentage'),
            themeToggleButton: document.getElementById('theme-toggle-button'),
            themeToggleButtonIcon: document.getElementById('theme-toggle-button').querySelector('i'),
        };

        const State = {
            currentTheme: AppConfig.defaultTheme || 'dark',
            isMuted: false,
            isPaused: false,
            currentVolume: AppConfig.initialVolume !== undefined ? AppConfig.initialVolume : 30,
            currentPlayerCount: 0,
            maxPlayerCount: 0,
            currentTipIndex: 0,
            tipIntervalId: null,
            youtubePlayer: null,
            localAudioPlayer: null,
            localVideoPlayer: DOM.localVideoBg,
            activeAudioSource: null,
            activeVideoSource: null,
        };

        const Utils = {
            escapeHTML: function(str) {
                if (typeof str !== 'string') str = String(str);
                const p = document.createElement('p');
                p.appendChild(document.createTextNode(str));
                return p.innerHTML;
            },
            openExternalUrl: function(url) {
                if (typeof window.invokeNative === 'function') {
                    window.invokeNative('openUrl', url);
                } else {
                    window.open(url, '_blank');
                    console.warn('invokeNative not found, opening URL in new tab as fallback.');
                }
            },
            loadScript: function(src, callback, async = true, defer = true) {
                if (document.querySelector(`script[src="${src}"]`)) { // Prevent multiple loads
                    if (callback) callback();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = async;
                script.defer = defer;
                script.onload = callback;
                script.onerror = () => console.error(`Failed to load script: ${src}`);
                document.head.appendChild(script);
            }
        };

        const ThemeManager = {
            init: function() {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    State.currentTheme = savedTheme;
                }
                this.applyTheme();
                DOM.themeToggleButton.addEventListener('click', () => this.toggleTheme());
                this.updateAccentColors();
            },
            applyTheme: function() {
                DOM.body.classList.remove('light-mode', 'dark-mode');
                DOM.body.classList.add(State.currentTheme + '-mode');
                localStorage.setItem('theme', State.currentTheme);
                DOM.themeToggleButtonIcon.className = State.currentTheme === 'dark' ? 'bi bi-brightness-high-fill' : 'bi bi-moon-stars-fill';

                if (AppConfig.enableParticles && AppConfig.particlesColor && window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
                    const particleColorConfig = AppConfig.particlesColor[State.currentTheme];
                    if (particleColorConfig && window.pJSDom[0].pJS.particles) { // Ensure particles object exists
                        window.pJSDom[0].pJS.particles.color.value = particleColorConfig;
                         if(window.pJSDom[0].pJS.fn && window.pJSDom[0].pJS.fn.particlesRefresh) {
                           window.pJSDom[0].pJS.fn.particlesRefresh();
                        }
                    }
                }
            },
            toggleTheme: function() {
                State.currentTheme = State.currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme();
            },
            updateAccentColors: function() {
                if (AppConfig.accentColor && (AppConfig.accentColor.light || AppConfig.accentColor.dark)) {
                    let styleSheet = document.getElementById('dynamic-accent-styles');
                    if (!styleSheet) {
                        styleSheet = document.createElement('style');
                        styleSheet.id = 'dynamic-accent-styles';
                        document.head.appendChild(styleSheet);
                    }
                    let cssRules = "";
                    if (AppConfig.accentColor.light) cssRules += `.light-mode { --accent-color-rgb: ${AppConfig.accentColor.light}; --accent-color: rgb(${AppConfig.accentColor.light}); }`;
                    if (AppConfig.accentColor.dark) cssRules += `.dark-mode { --accent-color-rgb: ${AppConfig.accentColor.dark}; --accent-color: rgb(${AppConfig.accentColor.dark}); }`;
                    styleSheet.textContent = cssRules;
                }
            }
        };

        const UIManager = {
            init: function() {
                document.title = AppConfig.documentTitle || 'Loading Screen';
                if (AppConfig.showServerLogo && AppConfig.serverLogoPath) {
                    DOM.serverLogo.src = AppConfig.serverLogoPath;
                    DOM.serverLogo.classList.remove('hidden');
                } else {
                    DOM.serverLogo.classList.add('hidden');
                }
                DOM.serverName.innerHTML = AppConfig.serverName;
                DOM.serverDescription.textContent = AppConfig.serverDescription;

                this.renderSocialLinks();
                if (AppConfig.showStaffTeam) this.renderStaffList(); else DOM.staffPanel.classList.add('hidden');

                const playerListDisabled = !AppConfig.showPlayerList || !AppConfig.fivemServerCode || AppConfig.fivemServerCode === "******" || AppConfig.fivemServerCode.trim() === "";
                if (playerListDisabled) {
                     DOM.playerListPanel.classList.add('hidden');
                }

                if (AppConfig.showTips) this.startTipsRotation(); else if (DOM.tipsMessages) DOM.tipsMessages.classList.add('hidden');
                if (AppConfig.showChangelog) this.renderChangelog(); else if (DOM.changelogFeed) DOM.changelogFeed.classList.add('hidden');

                if (!AppConfig.showTips && !AppConfig.showChangelog && DOM.messagesArea) {
                    DOM.messagesArea.classList.add('hidden');
                }
                this.updateProgress(0);
            },
            updateProgress: function(percentage) {
                const p = Math.min(100, Math.max(0, Math.round(percentage)));
                DOM.progressText.textContent = `${p}%`;
                DOM.progressBarInner.style.width = `${p}%`;
            },
            renderSocialLinks: function() {
                if (!AppConfig.socialLinks || AppConfig.socialLinks.length === 0) {
                    DOM.socialLinksContainer.innerHTML = ''; // Clear if empty
                    return;
                }
                DOM.socialLinksContainer.innerHTML = '';
                AppConfig.socialLinks.forEach(link => {
                    if (link.url && link.platform && link.iconClass) {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.setAttribute('aria-label', link.platform);
                        a.innerHTML = `<i class="${link.iconClass}"></i>`;
                        a.addEventListener('click', (e) => { e.preventDefault(); Utils.openExternalUrl(link.url); });
                        li.appendChild(a);
                        DOM.socialLinksContainer.appendChild(li);
                    }
                });
            },
            renderStaffList: function() {
                if (!AppConfig.staffTeam || AppConfig.staffTeam.length === 0) {
                    DOM.staffPanel.classList.add('hidden'); return;
                }
                DOM.staffList.innerHTML = '';
                AppConfig.staffTeam.forEach(staff => {
                    const item = document.createElement('div');
                    item.className = 'list-item staff-member';
                    item.innerHTML = `
                        <div class="info">
                            <img src="${Utils.escapeHTML(staff.image || AppConfig.playerProfileImagePlaceholder)}" alt="${Utils.escapeHTML(staff.name)}" class="pfp">
                            <span class="name">${Utils.escapeHTML(staff.name)}</span>
                        </div>
                        <span class="rank">${Utils.escapeHTML(staff.rank)}</span>`;
                    DOM.staffList.appendChild(item);
                });
                DOM.staffPanel.classList.remove('hidden');
            },
            renderPlayerList: function(players, maxPlayers) {
                 const playerListDisabled = !AppConfig.showPlayerList || !AppConfig.fivemServerCode || AppConfig.fivemServerCode === "******" || AppConfig.fivemServerCode.trim() === "";
                if (playerListDisabled) {
                    DOM.playerListPanel.classList.add('hidden');
                    return;
                }
                DOM.playerList.innerHTML = '';
                if (!players || players.length === 0) {
                    const notice = document.createElement('p');
                    notice.textContent = "No players currently online or list unavailable.";
                    notice.className = 'list-empty-notice';
                    DOM.playerList.appendChild(notice);
                } else {
                    players.forEach(player => {
                        const item = document.createElement('div');
                        item.className = 'list-item player-entry';
                        item.innerHTML = `
                            <div class="info">
                                <img src="${AppConfig.playerProfileImagePlaceholder}" alt="${Utils.escapeHTML(player.name)}" class="pfp">
                                <span class="name">${Utils.escapeHTML(player.name)}</span>
                            </div>
                            <span class="id">ID: ${player.id}</span>`;
                        DOM.playerList.appendChild(item);
                    });
                }
                this.updatePlayerCount(players ? players.length : 0, maxPlayers);
                DOM.playerListPanel.classList.remove('hidden');
            },
            updatePlayerCount: function(current, max) {
                State.currentPlayerCount = current;
                State.maxPlayerCount = max > 0 ? max : current; // If max is 0, use current as max (e.g. for full server)
                DOM.playerCount.textContent = `Players: ${current}/${State.maxPlayerCount}`;
            },
            startTipsRotation: function() {
                if (!AppConfig.tips || AppConfig.tips.length === 0 || !DOM.tipsMessages) {
                    if(DOM.tipsMessages) DOM.tipsMessages.classList.add('hidden'); return;
                }
                if (State.tipIntervalId) clearInterval(State.tipIntervalId);
                const tipElement = DOM.tipsMessages.querySelector('p') || DOM.tipsMessages;
                function displayTip() {
                    tipElement.style.opacity = 0;
                    setTimeout(() => {
                        tipElement.innerHTML = AppConfig.tips[State.currentTipIndex];
                        tipElement.style.opacity = 1;
                        State.currentTipIndex = (State.currentTipIndex + 1) % AppConfig.tips.length;
                    }, 300);
                }
                displayTip();
                if (AppConfig.tips.length > 1) State.tipIntervalId = setInterval(displayTip, AppConfig.tipInterval || 7000);
                DOM.tipsMessages.classList.remove('hidden');
                if(DOM.messagesArea) DOM.messagesArea.classList.remove('hidden');
            },
            renderChangelog: function() {
                if (!AppConfig.changelog || AppConfig.changelog.length === 0 || !DOM.changelogList) {
                    if(DOM.changelogFeed) DOM.changelogFeed.classList.add('hidden'); return;
                }
                DOM.changelogList.innerHTML = '';
                AppConfig.changelog.forEach(entry => {
                    const li = document.createElement('li');
                    let changesHTML = '';
                    if (entry.changes && entry.changes.length > 0) {
                        changesHTML = '<ul>' + entry.changes.map(ch => `<li>${Utils.escapeHTML(ch)}</li>`).join('') + '</ul>';
                    }
                    li.innerHTML = `
                        <div class="changelog-version-date">
                            <strong>${Utils.escapeHTML(entry.version)}</strong>${entry.date ? ' - <span class="date">' + Utils.escapeHTML(entry.date) + '</span>' : ''}
                        </div>
                        <div class="changelog-changes">${changesHTML}</div>`;
                    DOM.changelogList.appendChild(li);
                });
                DOM.changelogFeed.classList.remove('hidden');
                if(DOM.messagesArea) DOM.messagesArea.classList.remove('hidden');
            }
        };

        const BackgroundManager = {
            init: function() {
                this.setupBackground();
                if (AppConfig.enableParticles && typeof particlesJS === 'function') {
                    const particleConfig = JSON.parse(JSON.stringify(AppConfig.particlesConfig || {})); // Deep clone
                    if(AppConfig.particlesColor && AppConfig.particlesColor[State.currentTheme] && particleConfig.particles && particleConfig.particles.color) {
                        particleConfig.particles.color.value = AppConfig.particlesColor[State.currentTheme];
                    }
                    particlesJS('particles-js', particleConfig);
                    DOM.particlesJsContainer.style.opacity = 1;
                } else {
                    DOM.particlesJsContainer.classList.add('hidden');
                }
            },
            setupBackground: function() {
                if(DOM.localVideoBg) DOM.localVideoBg.classList.add('hidden');
                if(DOM.youtubeVideoBg) DOM.youtubeVideoBg.innerHTML = '';
                DOM.body.style.backgroundImage = 'none';
                DOM.body.style.background = ''; // Clear solid/gradient

                switch (AppConfig.backgroundType) {
                    case 'image':
                        if (AppConfig.backgroundImagePath) DOM.body.style.backgroundImage = `url('${AppConfig.backgroundImagePath}')`;
                        break;
                    case 'video':
                        if (AppConfig.enableLocalVideo && AppConfig.backgroundVideoPath) {
                            DOM.localVideoBg.src = AppConfig.backgroundVideoPath;
                            DOM.localVideoBg.style.opacity = AppConfig.videoOpacity !== undefined ? AppConfig.videoOpacity : 0.3;
                            DOM.localVideoBg.style.filter = AppConfig.videoBlur > 0 ? `blur(${AppConfig.videoBlur}px)` : 'none';
                            DOM.localVideoBg.classList.remove('hidden');
                            State.activeVideoSource = 'localVideo';
                             if (AppConfig.autoPlayMusic !== false) { // Assume video has audio unless muted by MediaPlayer
                                State.localVideoPlayer.play().catch(e => console.warn("Local video autoplay was blocked.", e));
                            }
                        } else if (AppConfig.youtubeVideoId) {
                            this.setupYouTubeVideo();
                            State.activeVideoSource = 'youtube';
                        }
                        break;
                    case 'gradient':
                        if (AppConfig.animatedGradient) {
                            const { color1, color2, color3, angle, animationSpeed } = AppConfig.animatedGradient;
                            DOM.body.style.background = `linear-gradient(${angle || '45deg'}, ${color1}, ${color2}, ${color3 || color2})`;
                            DOM.body.style.backgroundSize = '400% 400%';
                            DOM.body.style.animation = `animatedGradient ${animationSpeed || '15s'} ease infinite`;
                            let keyframesStyle = document.getElementById('gradient-keyframes');
                            if(!keyframesStyle) {
                                keyframesStyle = document.createElement('style');
                                keyframesStyle.id = 'gradient-keyframes';
                                keyframesStyle.textContent = `@keyframes animatedGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`;
                                document.head.appendChild(keyframesStyle);
                            }
                        }
                        break;
                    case 'color':
                        DOM.body.style.background = AppConfig.backgroundColor || '#333333';
                        break;
                }
            },
            setupYouTubeVideo: function() {
                if (!AppConfig.youtubeVideoId) return;
                // Ensure YT API is loaded only once
                if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                     Utils.loadScript('https://www.youtube.com/iframe_api', () => {
                        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                             window.onYouTubeIframeAPIReady = this.createYouTubePlayer.bind(this);
                        } else {
                            this.createYouTubePlayer();
                        }
                    }, false, false); // Not async/defer for YT API usually
                } else {
                     this.createYouTubePlayer();
                }
            },
            createYouTubePlayer: function() {
                if (State.youtubePlayer && typeof State.youtubePlayer.destroy === 'function') {
                    State.youtubePlayer.destroy();
                }

                const playerDiv = document.createElement('div');
                playerDiv.id = 'youtube-player-container';
                DOM.youtubeVideoBg.innerHTML = '';
                DOM.youtubeVideoBg.appendChild(playerDiv);
                DOM.youtubeVideoBg.style.opacity = AppConfig.videoOpacity !== undefined ? AppConfig.videoOpacity : 0.3;
                DOM.youtubeVideoBg.style.filter = AppConfig.videoBlur > 0 ? `blur(${AppConfig.videoBlur}px)` : 'none';

                State.youtubePlayer = new YT.Player(playerDiv.id, {
                    videoId: AppConfig.youtubeVideoId,
                    playerVars: {
                        autoplay: 1, controls: 0, showinfo: 0, rel: 0, loop: 1,
                        playlist: AppConfig.youtubeVideoId, fs: 0, iv_load_policy: 3,
                        modestbranding: 1, start: AppConfig.videoStartTime || 0,
                    },
                    events: {
                        'onReady': (event) => {
                            MediaPlayer.syncPlayerState(event.target); // Sync mute, pause, volume
                        },
                        'onStateChange': (event) => {
                            if (event.data === YT.PlayerState.ENDED) { // Loop
                                event.target.seekTo(AppConfig.videoStartTime || 0);
                                event.target.playVideo(); // Ensure it plays after seeking
                            }
                            if (event.data === YT.PlayerState.PLAYING) {
                                State.isPaused = false; MediaPlayer.updateUI();
                            }
                            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                State.isPaused = true; MediaPlayer.updateUI();
                            }
                        }
                    }
                });
            }
        };

        const MediaPlayer = {
            init: function() {
                if (AppConfig.enableBackgroundMusic) {
                    if (AppConfig.musicSourceType === 'local' && AppConfig.localAudioPath) {
                        State.localAudioPlayer = new Audio(AppConfig.localAudioPath);
                        State.localAudioPlayer.loop = true;
                        State.activeAudioSource = 'localAudio';
                    } else if (AppConfig.musicSourceType === 'youtube' && AppConfig.youtubeMusicId) {
                        // This is tricky if background video is also YouTube.
                        // For now, this would create a *separate* hidden YT player for music.
                        // Not implemented in this pass to avoid complexity with multiple YT players.
                        console.warn("Separate YouTube music player not fully implemented alongside YouTube video background yet.");
                    }
                }

                DOM.volumeSlider.value = State.currentVolume;
                DOM.volumePercentage.textContent = `${State.currentVolume}%`;
                this.applyVolumeToAllSources(State.currentVolume / 100);

                DOM.muteButton.addEventListener('click', () => this.toggleMute());
                DOM.pauseButton.addEventListener('click', () => this.togglePause());
                DOM.volumeSlider.addEventListener('input', (e) => this.setVolume(parseInt(e.target.value, 10)));

                // Initial play attempt for local audio
                if (AppConfig.autoPlayMusic && State.activeAudioSource === 'localAudio' && State.localAudioPlayer) {
                    this.playLocalAudio();
                }
                 // Initial play for local video (if it's the video source and autoplay is on)
                if (AppConfig.autoPlayMusic !== false && State.activeVideoSource === 'localVideo' && State.localVideoPlayer) {
                    State.localVideoPlayer.play().catch(e => console.warn("Local video autoplay was blocked.", e));
                    State.isPaused = false; // Assume playing
                }

                this.updateUI();
            },
            playLocalAudio: function() {
                if (State.localAudioPlayer) {
                    State.localAudioPlayer.play().then(() => {
                        State.isPaused = false;
                        this.updateUI();
                    }).catch(e => console.warn("Local audio autoplay was blocked.", e));
                }
            },
            applyVolumeToAllSources: function(volumeFraction) {
                if (State.localAudioPlayer) State.localAudioPlayer.volume = volumeFraction;

                // If local video is NOT the main audio source, keep it muted or respect its own config.
                // If local video IS the main audio source (no separate localAudioPlayer), control its volume.
                if (State.localVideoPlayer) {
                    if (State.activeAudioSource === 'localVideo' && !State.isMuted) { // Check if local video is supposed to play sound
                        State.localVideoPlayer.volume = volumeFraction;
                    } else if (State.activeAudioSource !== 'localVideo') { // If audio comes from elsewhere, video is visual only
                         State.localVideoPlayer.muted = true;
                    }
                }
                if (State.youtubePlayer && typeof State.youtubePlayer.setVolume === 'function') {
                    State.youtubePlayer.setVolume(volumeFraction * 100);
                }
            },
            syncPlayerState: function(playerInstance) { // playerInstance is usually a YT Player
                 if (playerInstance && typeof playerInstance.setVolume === 'function') {
                    playerInstance.setVolume(State.currentVolume);
                    if (State.isMuted) playerInstance.mute(); else playerInstance.unMute();
                    if (AppConfig.autoPlayMusic !== false && !State.isPaused) {
                         playerInstance.playVideo();
                    } else {
                        playerInstance.pauseVideo(); // Respect initial paused state if autoplay is off
                    }
                }
                this.updateUI();
            },
            setVolume: function(volume) {
                State.currentVolume = Math.max(0, Math.min(100, volume));
                DOM.volumeSlider.value = State.currentVolume;
                DOM.volumePercentage.textContent = `${State.currentVolume}%`;
                this.applyVolumeToAllSources(State.currentVolume / 100);
                if (State.currentVolume > 0 && State.isMuted) {
                    this.toggleMute(); // Unmute if volume is raised from 0
                } else {
                    this.updateUI();
                }
            },
            toggleMute: function() {
                State.isMuted = !State.isMuted;
                if (State.localAudioPlayer) State.localAudioPlayer.muted = State.isMuted;

                if (State.localVideoPlayer) {
                    // If local video is audio source OR no other audio source exists, toggle its mute
                    if (State.activeAudioSource === 'localVideo' || (!State.localAudioPlayer && !State.youtubePlayer)) {
                        State.localVideoPlayer.muted = State.isMuted;
                    } else { // Otherwise, local video is visual only, ensure it's muted
                        State.localVideoPlayer.muted = true;
                    }
                }

                if (State.youtubePlayer && typeof State.youtubePlayer.mute === 'function') {
                    if (State.isMuted) State.youtubePlayer.mute(); else State.youtubePlayer.unMute();
                }
                this.updateUI();
            },
            togglePause: function() {
                State.isPaused = !State.isPaused;
                if (State.localAudioPlayer) {
                    if (State.isPaused) State.localAudioPlayer.pause(); else State.localAudioPlayer.play();
                }
                if (State.localVideoPlayer) { // Pause/play video if it's the active one
                     if (State.isPaused) State.localVideoPlayer.pause(); else State.localVideoPlayer.play();
                }
                if (State.youtubePlayer && typeof State.youtubePlayer.pauseVideo === 'function') {
                    if (State.isPaused) State.youtubePlayer.pauseVideo(); else State.youtubePlayer.playVideo();
                }
                this.updateUI();
            },
            updateUI: function() {
                DOM.muteButtonIcon.className = State.isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
                DOM.pauseButtonIcon.className = State.isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill';
                DOM.muteButton.classList.toggle('active', State.isMuted);
                DOM.pauseButton.classList.toggle('active', State.isPaused);
            }
        };

        const FiveMConnector = {
            init: function() {
                const playerListDisabled = !AppConfig.showPlayerList || !AppConfig.fivemServerCode || AppConfig.fivemServerCode === "******" || AppConfig.fivemServerCode.trim() === "";
                if (!playerListDisabled) {
                    this.fetchPlayerData();
                } else {
                    UIManager.renderPlayerList([], 0);
                }
            },
            fetchPlayerData: function() {
                const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${AppConfig.fivemServerCode}`;
                fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        if (data && data.Data) {
                            const players = data.Data.players || [];
                            const maxPlayers = data.Data.sv_maxclients || (players.length > 0 ? players.length : 32); // Fallback max
                            UIManager.renderPlayerList(players, maxPlayers);
                        } else {
                            UIManager.renderPlayerList([], 0);
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching FiveM server data:", error);
                        UIManager.renderPlayerList([], 0);
                        DOM.playerListPanel.classList.add('hidden');
                    });
            }
        };

        const NuiEvents = {
            init: function() {
                window.addEventListener('message', (event) => {
                    if (event.data.eventName === 'loadProgress') {
                        UIManager.updateProgress(event.data.loadFraction * 100);
                    }
                });
            }
        };

        function init() {
            ThemeManager.init();
            UIManager.init(); // Must be after ThemeManager if UI elements depend on theme classes for initial render
            BackgroundManager.init();
            MediaPlayer.init();
            FiveMConnector.init();
            NuiEvents.init();

            // Add class to trigger load animations
            // Use a small timeout to ensure the DOM is fully painted before animations start
            setTimeout(() => {
                DOM.body.classList.add('animate-on-load');
            }, 100); // 100ms delay, can be adjusted

            console.log("Loading Screen Initialized (Vanilla JS Full).");
        }
        init();
    });
})();
