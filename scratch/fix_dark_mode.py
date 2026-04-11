import os
import glob
import re

base_path = "src/components/sections"
files = glob.glob(os.path.join(base_path, "*.tsx"))

# Using dictionary in specific order and regex for strict boundaries
replacements = [
    # Hover states first to prevent interference with base states
    (r'(?<!dark:)hover:bg-slate-200\b', r'hover:bg-slate-200 dark:hover:bg-slate-700'),
    (r'(?<!dark:)hover:bg-slate-100\b', r'hover:bg-slate-100 dark:hover:bg-slate-700'),
    (r'(?<!dark:)hover:bg-slate-50\b', r'hover:bg-slate-50 dark:hover:bg-slate-800'),
    
    # Specific specialized classes
    (r'bg-\[\#1e3a5f\]/5\b', r'bg-[#1e3a5f]/5 dark:bg-slate-900/50'),
    (r'(?<!dark:)active:bg-\[\#1d4ed8\]/20\b', r'active:bg-[#1d4ed8]/20 dark:active:bg-[#60a5fa]/20'),
    (r'(?<!dark:)selection:bg-\[\#3b82f6\]/30\b', r'selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40'),
    
    # Shadows
    (r'(?<!dark:)shadow-slate-200/50\b', r'shadow-slate-200/50 dark:shadow-none'),
    
    # Backgrounds
    (r'(?<!dark:)(?<!hover:)(?<!active:)(?<!focus:)bg-slate-100\b', r'bg-slate-100 dark:bg-slate-800/80'),
    (r'(?<!dark:)(?<!hover:)(?<!active:)(?<!focus:)bg-slate-200\b', r'bg-slate-200 dark:bg-slate-700'),
    (r'(?<!dark:)(?<!hover:)(?<!active:)(?<!focus:)bg-slate-50\b', r'bg-slate-50 dark:bg-slate-900/50'),
    (r'(?<!dark:)(?<!hover:)(?<!active:)(?<!focus:)bg-white\b', r'bg-white dark:bg-slate-900'),
    
    # Gradients
    (r'(?<!dark:)from-slate-50\b', r'from-slate-50 dark:from-slate-900'),
    (r'(?<!dark:)to-slate-100\b', r'to-slate-100 dark:to-slate-800'),

    # Borders
    (r'(?<!dark:)border-slate-300\b', r'border-slate-300 dark:border-slate-700'),
    (r'(?<!dark:)border-slate-200\b', r'border-slate-200 dark:border-slate-800'),
    (r'(?<!dark:)border-slate-100\b', r'border-slate-100 dark:border-slate-800'),

    # Text Colors - Must ignore inside `dark:`
    (r'(?<!dark:)(?<!hover:)text-slate-800\b', r'text-slate-800 dark:text-slate-200'),
    (r'(?<!dark:)(?<!hover:)text-slate-700\b', r'text-slate-700 dark:text-slate-300'),
    (r'(?<!dark:)(?<!hover:)text-slate-500\b', r'text-slate-500 dark:text-slate-400'),
    (r'(?<!dark:)(?<!hover:)text-slate-400\b', r'text-slate-400 dark:text-slate-500'),
    (r'(?<!dark:)(?<!hover:)text-\[\#1d4ed8\]\b', r'text-[#1d4ed8] dark:text-[#60a5fa]'),
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original_content = content
    
    # Run regex replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
            
    if content != original_content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print(f"Processed {len(files)} files.")
