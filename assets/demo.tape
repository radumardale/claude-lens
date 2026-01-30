# VHS tape file for claude-lens demo
# Run with: vhs assets/demo.tape

Output assets/demo.gif

Set FontSize 14
Set Width 1200
Set Height 700
Set Theme "Dracula"
Set Padding 20

# Start the TUI (default mode)
Type "npx tsx bin/claude-lens.ts"
Enter
Sleep 3s

# Navigate dashboard - down to Agents
Type "j"
Sleep 400ms
Type "j"
Sleep 400ms

# Enter Agents list
Enter
Sleep 1s

# Navigate the list
Type "j"
Sleep 300ms
Type "j"
Sleep 300ms
Type "j"
Sleep 300ms

# Enter detail view
Enter
Sleep 1.5s

# Go back to list
Escape
Sleep 500ms

# Go back to dashboard
Escape
Sleep 500ms

# Navigate to MCPs
Type "j"
Sleep 300ms
Type "j"
Sleep 300ms

# Enter MCPs
Enter
Sleep 1s

# Back to dashboard
Escape
Sleep 500ms

# Quit
Type "q"
Sleep 500ms
