import os
import glob

files = glob.glob("src/components/sections/*.tsx") + glob.glob("src/components/elements/*.tsx")

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    
    # 1. Clean up the messy metallic gradient classes added in the last steps
    content = content.replace(" dark:from-slate-400", "")
    content = content.replace(" dark:to-slate-200", "")
    content = content.replace(" dark:hover:from-slate-400", "")
    content = content.replace(" dark:hover:to-slate-200", "")
    
    content = content.replace(" dark:from-slate-500", "")
    content = content.replace(" dark:to-slate-300", "")
    content = content.replace(" dark:hover:from-slate-500", "")
    content = content.replace(" dark:hover:to-slate-300", "")
    
    # 2. Add dark:bg-none and solid colors where the light gradient exists
    # Button main: bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] -> dark mode solid white
    content = content.replace(
        "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6]",
        "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white"
    )
    
    # Hover states for buttons
    content = content.replace(
        "hover:from-[#1d4ed8] hover:to-[#3b82f6]",
        "hover:from-[#1d4ed8] hover:to-[#3b82f6] dark:hover:bg-slate-200"
    )
    
    # Text colors logic (text-white dark:text-slate-900 is already there from a previous pass, 
    # but we need to ensure the solid white background works naturally with it).
    # Since they ALREADY have dark:text-slate-900 or dark:text-slate-800 from our previous fix,
    # the black text on the new pure white button will contrast perfectly.

    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
