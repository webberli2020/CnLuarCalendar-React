<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5a22b818-10c8-43d8-adcf-0a8946aea8f1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


   ---
新的 React 应用程序与你之前的单文件 HTML 网页版有很大的不同。它不能直接双击 .html 文件在浏览器中运行，因为它需要一个“构建（Build）”过程来处理 TypeScript 代码和模块化的组件。
以下是关于如何运行这个新程序的详细说明：
1. 在当前环境（AI Studio）中运行
在当前的 AI Studio 环境中，程序已经自动运行了。
你可以在右侧的 预览窗口 中直接看到并操作这个万年历。
每当你修改代码，预览窗口会自动刷新以显示最新的更改。
2. 如何在你的电脑上本地运行
如果你想把这个项目下载到自己的电脑上运行，你需要安装 Node.js。
步骤如下：
准备环境：确保你的电脑安装了 Node.js（建议版本 18 或以上）。
安装依赖：在项目根目录下打开终端，运行：
code
Bash
npm install
启动开发服务器：运行以下命令启动本地预览：
code
Bash
npm run dev
访问地址：终端会显示一个地址（通常是 http://localhost:3000），在浏览器中打开它即可。
3. 为什么不能直接打开 HTML 文件？
模块化：React 使用 import 和 export 来组织代码，浏览器直接读取本地文件时会因为安全限制（CORS）而报错。
编译需求：TypeScript (.tsx) 代码必须经过 Vite 或 Webpack 等工具编译成普通的 JavaScript，浏览器才能理解。
资源处理：Tailwind CSS 等样式工具也需要经过处理才能生成最终的 CSS 样式。
4. 如果你想发布到网上
如果你想让别人通过网址访问你的万年历：
运行 npm run build。
这会生成一个 dist 文件夹，里面包含了优化后的 HTML、JS 和 CSS 文件。
将 dist 文件夹的内容上传到 GitHub Pages、Vercel 或 Netlify 等托管平台即可。
总结：如果你现在只想查看效果，直接看右侧的预览窗口即可。如果你需要离线使用，建议保留你原来的单文件 HTML 版本；如果你需要更强大的功能和更好的代码组织，这个 React 版本是更好的选择。

   
