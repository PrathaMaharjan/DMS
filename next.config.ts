import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // pdfkit reads its own font data files (.afm) via relative paths at
  // runtime. If Next's bundler tries to trace/bundle it, those relative
  // paths break (ENOENT: Helvetica.afm not found). This tells Next to
  // leave pdfkit alone entirely - required directly from node_modules,
  // the normal Node way, so its internal paths resolve correctly.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;