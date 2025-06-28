fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Nevera Development & Jules (Refactor)'
description '[FREE] Loading Screen - Enhanced & Refactored'
version '2.0.0' -- Updated version

-- Specifies that the loading screen will not automatically shut down.
-- Shutdown is handled manually in client.lua via ShutdownLoadingScreenNui().
loadscreen_manual_shutdown "yes"

-- Sets the HTML file to be used for the loading screen.
loadscreen 'html/index.html'

-- Enables the mouse cursor on the loading screen.
loadscreen_cursor "yes"

-- Client-side Lua script(s).
client_script "client.lua"

-- List of files to be included with the resource.
-- These files are made available to the NUI frame (html/index.html).
files {
    'html/index.html',
    'html/config.js',
    'html/assets/css/*.css',        -- All CSS files in the css directory
    'html/assets/js/*.js',          -- All JS files in the js directory
    'html/assets/img/**',           -- All files and subfolders in img
    'html/assets/audio/*',          -- All audio files in the audio folder
    'html/assets/video/*'           -- All video files in the video folder
    -- Ensure any new assets like fonts are also included if not web-sourced,
    -- e.g., 'html/assets/fonts/*'
}

-- Optional: Define resource dependencies if any are added later
-- dependency 'another_resource'
