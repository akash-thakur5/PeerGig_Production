import os, re

dir_path = 'src/app'
sidebar_import = "import Sidebar from '@/components/Sidebar';\n"

# Pages with a sidebar
pages_to_update = [
    'dashboard/page.tsx',
    'wallet/page.tsx', 
    'tutor/page.tsx',
    'tutor/create/page.tsx',
    'tutor/create/pricing/page.tsx',
    'student/page.tsx',
    'search/page.tsx',
    'skillswap/page.tsx',
    'skillswap/post/page.tsx',
    'skillswap/propose/page.tsx',
    'profile/page.tsx',
    'notes/page.tsx',
    'messages/page.tsx',
    'history/page.tsx',
    'connect/page.tsx',
    'book-session/page.tsx'
]

aside_regex = re.compile(r'<aside.*?</aside>', re.DOTALL)

for page in pages_to_update:
    path = os.path.join(dir_path, page)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add import if missing
        if 'import Sidebar' not in content:
            # find first import
            first_import_pos = content.find('import')
            if first_import_pos != -1:
                end_of_line = content.find('\n', first_import_pos)
                content = content[:end_of_line+1] + sidebar_import + content[end_of_line+1:]
        
        # Replace ONLY the FIRST <aside> match with <Sidebar />
        new_content = aside_regex.sub('<Sidebar />', content, count=1)
        
        # If it's the wallet page, fix the flex container issue because it used sticky Instead of fixed
        if page == 'wallet/page.tsx':
            new_content = new_content.replace('<div className="flex min-h-screen">', '<div>')
            new_content = new_content.replace('<main className="flex-1 min-w-0">', '<main className="md:ml-64 min-w-0">')
            
        if page == 'book-session/page.tsx':
            new_content = new_content.replace('<main className="flex-1 mt-16 pb-12 lg:ml-[280px]">', '<main className="flex-1 mt-16 pb-12 md:ml-64">')

        if content != new_content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {path}')
