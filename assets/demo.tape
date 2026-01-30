# VHS tape file for claude-lens demo
# Run with: vhs assets/demo.tape

Output assets/demo.gif

Set FontSize 20
Set Width 1200
Set Height 600
Set Theme "Dracula"
Set Padding 20

# Start the TUI (default mode)
Type "npx claude-lens"
Enter
Sleep 8s

# Navigate dashboard - down to Agents
Type "j"
Sleep 1400ms

# Enter Agents list
Enter
Sleep 1s

# Navigate to second agent 
Type "j"
Sleep 1s
# Enter
# Sleep 5s 
# Escape
# Sleep 1s
Space
Sleep 5s
Left

# Navigate the list
Type "j"
Sleep 900ms
Type "j"
Sleep 900ms
Type "j"
Sleep 900ms

# Enter detail view
Enter
Sleep 1.5s

# Go back to list
Escape
Sleep 800ms

# Go back to dashboard
Escape
Sleep 800ms

# Navigate to MCPs
# Type "j"
# Sleep 900ms
# Type "j"
# Sleep 900ms

# Enter MCPs
# Enter
# Sleep 1s

# Back to dashboard
Escape
Sleep 800ms

# Quit
Type "q"
Sleep 800ms
