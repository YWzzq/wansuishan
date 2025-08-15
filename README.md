# 万岁山景区预约系统

这是一个为万岁山景区设计的预约抢票系统，支持三种用户角色：超级管理员、管理员和抢票人。系统使用Firebase作为后端服务，实现数据共享和用户认证功能。

## 功能特性

- 三种用户角色权限管理
  - 超级管理员：生成邀请码、管理用户权限
  - 管理员：发布和管理预约信息
  - 抢票人：查看和接受预约
- 六个固定场次预约
  - 祝家庄三场（09:00, 11:00, 13:00）
  - 打铁花三场（15:00, 17:00, 19:00）
- 邀请码注册机制
- 实时数据同步
- 响应式设计，支持移动端访问

## 技术栈

- 前端：HTML5, CSS3, JavaScript (原生)
- 后端：Firebase Authentication, Firebase Realtime Database
- 部署：GitHub Pages

## 快速开始

有关更详细的部署说明，请参阅 [DEPLOYMENT.md](DEPLOYMENT.md) 文件。

### Firebase CLI命令运行位置说明

在DEPLOYMENT.md文件中提到的Firebase CLI命令（如`npm install -g firebase-tools`、`firebase login`、`firebase init`、`firebase deploy`）需要在终端/命令行中运行，而不是在浏览器控制台中。具体操作：

1. 在Windows系统中，可以使用命令提示符(CMD)、PowerShell或Git Bash
2. 在macOS/Linux系统中，可以使用终端(Terminal)
3. 需要在项目的根目录中运行这些命令

### 1. Firebase项目设置

1. 访问[Firebase控制台](https://console.firebase.google.com/)
2. 创建新项目或使用现有项目
3. 启用Authentication服务
   - 在左侧菜单选择"Authentication"
   - 点击"登录方法"标签
   - 启用"电子邮件/密码"登录提供方
4. 获取项目配置信息
   - 在项目设置中找到Firebase SDK代码段
   - 复制配置信息用于下一步

### 2. 更新配置

1. 编辑`js/app.js`文件
2. 将Firebase配置信息替换为您的项目配置：
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

### 3. 数据库规则设置

在Firebase Realtime Database中设置以下安全规则：

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

### 4. 初始化数据

1. 部署网站到GitHub Pages
2. 使用超级管理员账户登录
3. 打开浏览器开发者工具控制台
4. 运行以下命令初始化数据库：
   ```javascript
   initializeDatabase();
   ```

### 5. 生成邀请码

超级管理员可以生成不同角色的邀请码：
```javascript
// 生成管理员邀请码
generateInviteCode('admin');

// 生成抢票人邀请码
generateInviteCode('ticketUser');
```

### 6. 创建测试账号

为了方便测试，您可以手动在Firebase Authentication中创建测试账号：

1. 进入Firebase控制台
2. 选择您的项目
3. 在左侧菜单选择"Authentication"
4. 点击"用户"标签
5. 点击"添加用户"
6. 输入邮箱和密码创建测试账号

然后使用超级管理员账号登录系统，生成邀请码分配给这些测试账号。

## 部署到GitHub Pages

1. 在GitHub上创建新仓库
2. 将代码推送到仓库
3. 在仓库设置中启用GitHub Pages
   - 进入仓库Settings
   - 找到Pages部分
   - 选择部署源为GitHub Actions或master分支
4. 访问您的网站：`https://<username>.github.io/<repository-name>/`

## 使用说明

### 超级管理员

1. 使用超级管理员账户登录
2. 在超级管理员面板生成邀请码
3. 分发邀请码给其他用户

### 管理员

1. 使用管理员邀请码注册账户
2. 登录后可在管理员面板发布预约信息

### 抢票人

1. 使用抢票人邀请码注册账户
2. 登录后可查看所有场次
3. 选择场次并接受预约（每个用户只能预约一次）

## 开发指南

### 项目结构

```
.
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 应用逻辑
└── README.md           # 项目说明
```

### 自定义场次

如需修改场次信息，编辑`js/app.js`中的`shows`数组：
```javascript
const shows = [
    { id: 'zjz1', name: '祝家庄一场', time: '09:00', description: '祝家庄表演一场' },
    // 添加或修改场次...
];
```

## 注意事项

1. Firebase免费套餐有限制，请注意使用量
2. 每个场次最多20人预约
3. 每个用户只能预约一个场次
4. 邀请码只能使用一次

## 支持浏览器

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

本项目为万岁山景区内部使用，未经许可不得用于其他用途。
