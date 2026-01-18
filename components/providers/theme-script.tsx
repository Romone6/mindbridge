export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const theme = localStorage.getItem('theme') || 'system';
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const appliedTheme = theme === 'system' ? systemTheme : theme;
            document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
          } catch (e) {}
        `,
      }}
    />
  );
}