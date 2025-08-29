import '../globals.css';
import '../styles/login.css';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>SmartStart - Login</title>
        <meta name="description" content="Sign in to SmartStart - AliceSolutions Ventures Hub" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="dark-theme">
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
