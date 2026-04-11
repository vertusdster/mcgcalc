import os
import glob

files = glob.glob("src/components/sections/*.tsx") + glob.glob("src/components/elements/*.tsx")

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    
    # 1. Change the output numbers and highlighted text from light blue to pure white in dark mode
    content = content.replace("dark:text-[#60a5fa]", "dark:text-white")
    
    # 2. Change the syringe liquid from light sky cyan to a deeper solid medical blue
    if "animated-syringe.tsx" in f:
        content = content.replace("dark:bg-sky-400", "dark:bg-blue-600")
        # Since liquid is now dark blue, the ticks INSIDE it should be pure white for contrast!
        content = content.replace("text-white dark:text-slate-900", "text-white")
        content = content.replace("bg-white dark:bg-slate-900", "bg-white")
    
    # 3. Double check other calculators where the total text might have been missed or uses #1d4ed8
    # If there are any text-[#1d4ed8] without dark modes attached, we'll leave them if they weren't caught
    # But dark:text-[#60a5fa] is our unique identifier for what was replaced.

    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
