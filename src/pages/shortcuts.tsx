const shortcuts = [
  ["Keyboard Shortcuts", "?"],
  ["Search", "/"],
  ["New Post", "n"],
  ["Scroll to top", "."],
  ["Next Post", "j"],
  ["Previous Post", "k"],
  ["Open Post", "o"],
  ["Edit Post", "e"],
  ["About", "ga"],
  ["Home", "gh"],
  ["Notification", "gn"],
  ["Liked", "gl"],
  ["Following", "gf"],
  ["Profile", "gp"],
  ["Send/Save Post", "(CTRL|⌘)+Enter, (CTRL|⌘)+s"],
  ["Switch between Preview and Edit", "(CTRL|⌘)+p"],
];

export default function Shortcuts() {
  return (
    <>
      <title>Keyboard Shortcuts - Leaves</title>
      <meta property="og:url" content="https://leaves.chiba.dev/" />
      <meta property="og:title" content="Leaves" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@tomofummy" />
      <meta name="twitter:creator" content="@tomofummy" />
      <meta
        name="twitter:image"
        content="https://leaves.chiba.dev/assets/img/icon-192x192.png"
      />
      <main className="container">
        <h1>
          <img
            src="/assets/img/question-circle-fill.svg"
            alt="Edit"
            width="32"
            height="32"
            className="me-2"
          />
          Keyboard Shortcuts
        </h1>
        <div className="markdown-body shortcuts-content">
          <table>
            <thead>
              <tr><th>Action</th><th>Mappings</th></tr>
            </thead>
            <tbody>
              {shortcuts.map(([action, mapping]) => (
                <tr key={action}><td>{action}</td><td>{mapping}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
