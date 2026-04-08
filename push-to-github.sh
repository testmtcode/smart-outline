#!/bin/bash

cd /home/test/桌面/smart-outline

# 1. 初始化 git
echo "1. 初始化 git..."
git init

# 2. 创建 .gitignore
echo "2. 创建 .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
dist/
*.zip
test-*.html
test-result-*.png
run-tests.js
generate-*.js
fix-*.js
promo-small.html
promo-small.png
screenshot-*.png
compat-*.png
EOF

# 3. 添加所有文件
echo "3. 添加文件..."
git add .

# 4. 提交
echo "4. 提交..."
git commit -m "Initial commit: SmartOutline v2.0.0"

# 5. 连接远程仓库
echo "5. 连接远程仓库..."
git remote add origin https://github.com/testmtcode/smart-outline.git

# 6. 推送
echo "6. 推送到 GitHub..."
git push -u origin main

echo "完成！"
