import os
import re

nav_regex = re.compile(r'<nav.*?</nav>', re.DOTALL)

for root, dirs, files in os.walk('app/(app)'):
    for name in files:
        if name.endswith('.tsx'):
            file = os.path.join(root, name)
            with open(file, 'r') as f:
                content = f.read()
            
            if '<nav' in content:
                content = nav_regex.sub('', content)
                print(f"Stripped <nav> from {file}")
                with open(file, 'w') as f:
                    f.write(content)

