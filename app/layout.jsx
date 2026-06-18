import "./globals.css";

export const metadata = {
  title: "帮你选奶茶",
  description: "先选个大类，再让转盘决定今天喝什么。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
