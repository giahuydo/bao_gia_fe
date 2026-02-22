"use client";

import { useState } from "react";

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678";

export default function WorkflowsPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-lg font-semibold">n8n Workflows</h1>
        <a
          href={N8N_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Open in new tab &rarr;
        </a>
      </div>
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading n8n...</p>
            </div>
          </div>
        )}
        <iframe
          src={N8N_URL}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-read; clipboard-write"
          title="n8n Workflow Editor"
        />
      </div>
    </div>
  );
}
