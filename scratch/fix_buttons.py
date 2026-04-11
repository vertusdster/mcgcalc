import os
import glob
import re

base_path = "src/components/sections"
files = glob.glob(os.path.join(base_path, "*.tsx"))

replacements = [
    # Normal gradient 
    (r'(?<!dark:)from-\[\#1d4ed8\](?!\/)', r'from-[#1d4ed8] dark:from-slate-200'),
    (r'(?<!dark:)to-\[\#3b82f6\](?!\/)', r'to-[#3b82f6] dark:to-slate-400'),
    
    # Hover gradient
    (r'(?<!dark:)hover:from-\[\#1d4ed8\](?!\/)', r'hover:from-[#1d4ed8] dark:hover:from-slate-200'),
    (r'(?<!dark:)hover:to-\[\#3b82f6\](?!\/)', r'hover:to-[#3b82f6] dark:hover:to-slate-400'),
]

processed = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    changed = False
    for i, line in enumerate(lines):
        # We only want to turn text-white into metallic dark text IF it's one of the primary gradient buttons.
        target_gradient_present = 'from-[#1d4ed8]' in line or 'to-[#3b82f6]' in line
        if target_gradient_present and 'text-white' in line:
            if 'dark:text-slate-900' not in line:
                lines[i] = lines[i].replace('text-white', 'text-white dark:text-slate-900')
                changed = True
                
        if target_gradient_present and 'hover:text-white' in line:
            if 'dark:hover:text-slate-900' not in line:
                lines[i] = lines[i].replace('hover:text-white', 'hover:text-white dark:hover:text-slate-900')
                changed = True
        
        # Apply the from/to gradient replacements safely
        for pattern, replacement in replacements:
            new_line = re.sub(pattern, replacement, lines[i])
            if new_line != lines[i]:
                lines[i] = new_line
                changed = True

    if changed:
        with open(f, 'w', encoding='utf-8') as file:
            file.writelines(lines)
        processed += 1

print(f"Processed {processed} files.")
