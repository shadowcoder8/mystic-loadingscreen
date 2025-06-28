/*=================================================================*\
/* By:         | Nevera Development & Refactored by Jules        |
/* FiveM:      | https://forum.cfx.re/u/neveradevelopment    |
/* Discord:    | https://discord.gg/NeveraDev/tw28AqrgWU     |
/*=================================================================*/
/* If you have any problems you can contact us via discord. <3   */

const Config = {
    // General Settings
    documentTitle: "My Server - Loading Screen", // Title of the HTML document
    serverLogoPath: "", // Path to your server logo. BLANK FOR NO LOGO. Example: "assets/img/my_logo.png"
                                              // Recommended size: 200x200px or similar aspect ratio

    // Text Content
    serverName: "<strong>MY</strong>SERVER",         // Main server name, supports <strong> for emphasis
    serverDescription: "Welcome to our awesome FiveM server! Explore unique scripts, custom vehicles, and engage in thrilling roleplay.",

    // Theme & Appearance
    defaultTheme: "dark", // "light" or "dark" - User preference will be stored in localStorage
    accentColor: { // Overrides default theme accent colors if specified. RGB format for CSS variables.
        light: "0, 123, 255", // Example: Blue for light mode (rgb(0,123,255))
        dark: "0, 174, 255"   // Example: Lighter blue for dark mode (rgb(0,174,255))
    }, // Set to null or empty strings (e.g., light: "") to use default CSS accent colors for that mode.

    // Background Configuration
    backgroundType: "image", // Options: "image", "video", "gradient", "color"
                              // (Canvas particles can be an overlay, see enableParticles)

    backgroundImagePath: "assets/img/orange.jpg", // Path to static background image if backgroundType is "image"
                                                    // Add more images to html/assets/img/ and change path here

    backgroundVideoPath: "assets/video/video.webm", // Path to local video if backgroundType is "video" and using local video
    enableLocalVideo: true, // Set to true for local video, false for YouTube
    youtubeVideoId: "", // Example: "dQw4w9WgXcQ" - YouTube video ID if backgroundType is "video" and enableLocalVideo is false
    videoStartTime: 0, // Start time in seconds for YouTube video
    videoOpacity: 0.3, // Opacity for video backgrounds (0.0 to 1.0)
    videoBlur: 2, // Blur in pixels for video backgrounds (0 for no blur)

    animatedGradient: { // If backgroundType is "gradient"
        color1: "#ff9a9e",
        color2: "#fad0c4",
        color3: "#fad0c4", // Can be same as color2 for two-color gradient
        angle: "45deg", // Angle of the gradient
        animationSpeed: "20s" // Speed of the animation (e.g., "15s", "30s")
    },

    backgroundColor: "#333333", // If backgroundType is "color" (solid color)

    enableParticles: true, // Enable/disable particle.js effect overlay
    particlesConfig: { // Configuration for particles.js (standard particles.js JSON object)
                       // You can generate one from https://vincentgarreau.com/particles.js/
        "particles": {
            "number": {"value": 80, "density": {"enable": true, "value_area": 800}},
            "color": {"value": "#ffffff"}, // This color will be overridden by particlesColor based on theme if defined below
            "shape": {"type": "circle"},
            "opacity": {"value": 0.5, "random": false},
            "size": {"value": 3, "random": true},
            "line_linked": {"enable": false},
            "move": {"enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out"}
        },
        "interactivity": {"detect_on": "canvas", "events": {"onhover": {"enable": false}, "onclick": {"enable": false}}},
        "retina_detect": true
    },
    particlesColor: { // Optional: define particle colors for light and dark themes
        light: "#333333", // Particles color for light mode
        dark: "#ffffff"   // Particles color for dark mode
    }, // If not defined, the color in particlesConfig.particles.color.value will be used.

    // Audio Settings
    enableBackgroundMusic: true,
    musicSourceType: "local", // "local" or "youtube" (if background is not already YouTube video)
    localAudioPath: "assets/audio/audio.mp3", // Path to local audio file
    youtubeMusicId: "r2S1I_O2XhY", // YouTube video ID for music ONLY if musicSourceType is "youtube"
    initialVolume: 30, // 0 to 100 - Recommended lower default
    autoPlayMusic: true,

    // Content Display
    showServerLogo: true,
    showStaffTeam: true,
    showPlayerList: true, // Fetches from FiveM server list API
    showTips: true,
    showChangelog: true,

    // Staff Team List (if showStaffTeam is true)
    staffTeam: [
        { name: "Jules The Dev", rank: "Lead Developer", image: "assets/img/pfp_placeholder.png" },
        { name: "Assistant AI", rank: "Co-Developer", image: "assets/img/pfp_placeholder.png" },
        // Add more staff members here
    ],

    // Player List Settings (if showPlayerList is true)
    fivemServerCode: "", // Your server CODE from FiveM (e.g., "abcdef" from cfx.re/join/abcdef)
                         // LEAVE BLANK OR "******" TO DISABLE ACTUAL PLAYER LIST FETCHING (shows placeholders or nothing)
    playerProfileImagePlaceholder: "assets/img/pfp_placeholder.png", // Placeholder if specific player images aren't available

    // Tips / Messages (if showTips is true) - displayed one at a time, rotating
    tips: [
        "Press F1 for help in-game.",
        "Join our Discord for updates and community chat!",
        "Remember to follow server rules for the best experience.",
        "Loading awesome assets for you...",
    ],
    tipInterval: 7000, // Time in milliseconds to display each tip

    // Changelog (if showChangelog is true)
    changelog: [
        { version: "v1.1 - Shiny Update", date: "2024-07-28", changes: ["Added dark/light mode.", "Implemented glassmorphism UI.", "New configuration options."] },
        { version: "v1.0 - Initial Release", date: "2024-07-01", changes: ["Basic loading screen features.", "Configurable text and background."] },
        // Add more changelog entries here, newest first preferably
    ],

    // Social Media Links
    socialLinks: [
        { platform: "Discord", url: "https://discord.gg/yourinvite", iconClass: "bi bi-discord" },
        { platform: "Website", url: "https://yourwebsite.com", iconClass: "bi bi-globe" },
        // { platform: "Twitter", url: "#", iconClass: "bi bi-twitter-x" },
    ],
};

// Make Config globally accessible (if not using modules, standard for simple config like this)
window.AppConfig = Config;
