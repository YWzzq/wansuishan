# 万岁山景区预约系统部署指南

本指南将详细介绍如何配置和部署万岁山景区预约系统。

## 目录
1. [系统要求](#系统要求)
2. [Firebase项目设置](#firebase项目设置)
3. [GitHub仓库设置](#github仓库设置)
4. [配置应用程序](#配置应用程序)
5. [部署到GitHub Pages](#部署到github-pages)
6. [初始化系统](#初始化系统)
7. [创建用户和邀请码](#创建用户和邀请码)
8. [故障排除](#故障排除)

## 系统要求

- 一个Google账户（用于Firebase）
- 一个GitHub账户
- 现代浏览器（Chrome, Firefox, Safari, Edge）

## Firebase项目设置

### 1. 创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称（例如："万岁山预约系统"）
4. 选择或创建Google Analytics账户（可选）
5. 点击"创建项目"

### 2. 启用Authentication服务

1. 在Firebase控制台中，选择您的项目
2. 在左侧菜单中点击"Authentication"
3. 点击"登录方法"标签
4. 点击"电子邮件/密码"提供方
5. 启用"电子邮件/密码"登录方式
6. 点击"保存"

### 3. 启用Realtime Database

1. 在左侧菜单中点击"Realtime Database"
2. 点击"创建数据库"
3. 选择"在测试模式下启动"（稍后会设置安全规则）
4. 选择合适的区域（建议选择离您最近的区域）
5. 点击"完成"

### 4. 获取项目配置信息

1. 在左侧菜单中点击"项目概览"
2. 点击"项目设置"（齿轮图标）
3. 在"常规"标签页中，找到"Firebase SDK代码段"
4. 选择"配置"选项
5. 复制配置信息，稍后会用到

## GitHub仓库设置

### 1. 创建GitHub仓库

1. 登录到您的GitHub账户
2. 点击右上角的"+"号，选择"New repository"
3. 输入仓库名称（例如："wansuishan-booking"）
4. 选择公共或私有（建议公共以便使用GitHub Pages）
5. 不要初始化README、.gitignore或license
6. 点击"Create repository"

### 2. 推送代码到仓库

1. 在本地项目目录中打开终端
2. 初始化Git仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. 添加远程仓库并推送：
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

## 配置应用程序

### 1. 更新Firebase配置

1. 打开`js/app.js`文件
2. 找到Firebase配置部分：
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
3. 将占位符替换为您从Firebase获取的实际配置信息

### 2. 设置数据库安全规则

1. 在Firebase控制台中，进入"Realtime Database"
2. 点击"规则"标签
3. 将现有规则替换为以下规则：
   ```json
   {
     "rules": {
       "users": {
         ".read": "auth != null",
         ".write": "auth != null",
         "$uid": {
           ".write": "$uid === auth.uid"
         }
       },
       "shows": {
         ".read": "auth != null",
         ".write": "root.child('users').child(auth.uid).child('role').val() == 'admin' || root.child('users').child(auth.uid).child('role').val() == 'superAdmin'"
       },
       "inviteCodes": {
         ".read": "root.child('users').child(auth.uid).child('role').val() == 'superAdmin'",
         ".write": "root.child('users').child(auth.uid).child('role').val() == 'superAdmin'"
       },
       "userReservations": {
         ".read": "auth != null",
         ".write": "auth != null",
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```
4. 点击"发布"

## 部署到GitHub Pages

### 1. 启用GitHub Pages

1. 在您的GitHub仓库页面，点击"Settings"标签
2. 在左侧菜单中找到"Pages"
3. 在"Source"部分，选择"Deploy from a branch"
4. 在"Branch"下拉菜单中选择"main"
5. 点击"Save"
6. 等待几分钟，GitHub Pages会自动部署您的网站

### 2. 访问部署的网站

1. 部署完成后，页面会显示您的网站URL
2. 通常格式为：`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

## 使用Firebase CLI部署（可选）

如果您希望使用Firebase Hosting而不是GitHub Pages，可以使用Firebase CLI工具：

### 1. 安装Firebase CLI

在终端/命令行中运行以下命令：
```bash
npm install -g firebase-tools
```

### 2. 登录Firebase

```bash
firebase login
```

### 3. 初始化Firebase项目

在项目根目录中运行：
```bash
firebase init
```

选择"Hosting"选项，然后按照提示操作。

### 4. 部署项目

```bash
firebase deploy
```

部署完成后，Firebase会提供一个URL来访问您的网站。

## 初始化系统

### 1. 创建超级管理员账户

1. 访问您的部署网站
2. 点击"注册"标签
3. 输入邮箱和密码
4. 在邀请码字段中输入"super-admin"（这是一个特殊的邀请码）
5. 点击"注册"
6. 注册成功后，重新登录

### 2. 初始化数据库

1. 使用超级管理员账户登录系统
2. 按F12打开浏览器开发者工具
3. 点击"控制台"标签
4. 输入以下命令并按回车：
   ```javascript
   initializeDatabase();
   ```
5. 您应该会在控制台看到"数据库初始化完成"的消息

## 创建用户和邀请码

### 1. 生成邀请码

1. 确保您以超级管理员身份登录
2. 在页面底部找到"超级管理员面板"
3. 打开浏览器开发者工具（F12）
4. 在控制台中输入以下命令生成管理员邀请码：
   ```javascript
   generateInviteCode('admin');
   ```
5. 生成抢票人邀请码：
   ```javascript
   generateInviteCode('ticketUser');
   ```
6. 邀请码会显示在弹出的提示框中

### 2. 创建测试用户

1. 在Firebase控制台的"Authentication"部分
2. 点击"用户"标签
3. 点击"添加用户"
4. 输入测试用户的邮箱和密码
5. 点击"添加用户"

### 3. 分配角色给用户

1. 将生成的邀请码分发给相应的用户
2. 用户使用邀请码注册后会自动获得相应角色

## 故障排除

### 常见问题

#### 1. Firebase配置错误
**问题：** 网站无法连接到Firebase
**解决方案：** 检查`js/app.js`中的Firebase配置是否正确

#### 2. 权限错误
**问题：** 用户无法执行某些操作
**解决方案：** 检查Firebase数据库规则是否正确设置

#### 3. 部署失败
**问题：** GitHub Pages部署失败
**解决方案：** 检查GitHub仓库设置，确保选择了正确的分支

#### 4. 邀请码无效
**问题：** 用户使用邀请码注册时提示无效
**解决方案：** 确保邀请码已正确生成且未被使用

### 联系支持

如果遇到其他问题，请检查浏览器控制台错误信息，或联系技术支持。

## 维护和更新

### 更新代码
1. 在本地修改代码
2. 提交更改到GitHub：
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. GitHub Pages会自动重新部署

### 监控使用情况
1. 定期检查Firebase控制台的使用情况
2. 确保未超出免费套餐限制

## 安全建议

1. 定期更新Firebase安全规则
2. 不要在代码中暴露敏感信息
3. 定期检查用户权限
4. 备份重要数据
