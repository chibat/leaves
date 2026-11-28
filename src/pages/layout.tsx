import { useEffect, type ReactNode } from "react";
import { Link, useShared } from "@void/react";
import Header from "~/islands/Header.tsx";
import "github-markdown-css/github-markdown-light.css";

export default function Layout({ children }: { children: ReactNode }) {
  const shared = useShared();

  useEffect(() => {
    void import("~/scripts/copy-code.ts");
  }, []);

  return (
    <>
      <Header user={shared.user} authUrl={shared.authUrl} />
      {children}
      <footer className="container d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <p className="col-md-4 mb-0 text-muted">
          &copy;<a
            href="https://chiba.dev"
            target="_blank"
            className="doc text-muted"
          >
            chibat
          </a>
        </p>
        <ul className="nav col-md-8 justify-content-end">
          <li className="nav-item">
            <Link href="/" className="nav-link px-2 text-muted">Home</Link>
          </li>
          <li className="nav-item">
            <Link href="/about" className="nav-link px-2 text-muted">About</Link>
          </li>
          <li className="nav-item">
            <Link href="/terms" className="nav-link px-2 text-muted">
              Terms of Service
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/privacy" className="nav-link px-2 text-muted">
              Privacy Policy
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/sitemap" className="nav-link px-2 text-muted">
              Sitemap
            </Link>
          </li>
        </ul>
      </footer>
    </>
  );
}
