-- client.lua
-- Original by Nevera Development, Refactored by Jules

-- Event handler for when the player has spawned
AddEventHandler("playerSpawned", function()
    -- Print a message to the client console indicating the loading screen is being shut down
    print("[LoadingScreen] Player has spawned. Shutting down NUI.")

    -- Shutdown the NUI frame (the HTML loading screen)
    -- This is the primary function to use when loadscreen_manual_shutdown "yes" is set in fxmanifest.lua
    ShutdownLoadingScreenNui()

    -- The native ShutdownLoadingScreen() is deprecated for manual shutdown scenarios and generally not needed here.
end)

-- Example of how you might add a command to manually hide the loading screen (for testing/development)
-- To use this, uncomment the lines below.
-- RegisterCommand("hidels", function(source, args, rawCommand)
--     print("[LoadingScreen] Attempting to manually hide NUI via command.")
--     ShutdownLoadingScreenNui()
-- end, false) -- Setting 'false' means the command is restricted (e.g., by ACE permissions for admins)
               -- Set to 'true' to allow anyone to use it (not recommended for production)

-- You could also add logic here to send NUI messages to your HTML/JS if needed for more complex interactions
-- before shutdown, but for a simple loading screen, this is usually not required.
-- For example:
-- SendNUIMessage({ type = "clientSpawned" })
-- Citizen.Wait(100) -- Give NUI time to process if needed
-- ShutdownLoadingScreenNui()
