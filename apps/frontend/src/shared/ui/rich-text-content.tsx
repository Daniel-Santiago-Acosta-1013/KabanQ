import { cn } from "@/shared/lib/utils";

interface RichTextContentProps {
  html: string;
  className?: string;
  compact?: boolean;
}

export function RichTextContent({ html, className, compact }: RichTextContentProps) {
  if (!html || html === "<p></p>") return null;

  const isPlainText = !html.trim().startsWith("<") && !html.includes("<p>");

  if (isPlainText) {
    return (
      <p className={cn("text-xs text-muted-foreground", compact && "line-clamp-1", className)}>
        {html}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-muted-foreground",
        compact && "line-clamp-1",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
