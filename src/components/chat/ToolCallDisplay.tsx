"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
  className?: string;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isComplete: boolean
): string {
  const path = typeof args.path === "string" ? args.path : null;
  const filename = path ? path.split("/").pop() || path : null;

  if (toolName === "str_replace_editor") {
    const command = typeof args.command === "string" ? args.command : null;
    if (!filename) {
      return isComplete ? "File operation complete" : "Working on files\u2026";
    }
    switch (command) {
      case "create":
        return isComplete ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return isComplete ? `Edited ${filename}` : `Editing ${filename}`;
      case "view":
        return isComplete ? `Read ${filename}` : `Reading ${filename}`;
      case "undo_edit":
        return isComplete ? `Reverted ${filename}` : `Reverting ${filename}`;
      default:
        return isComplete ? "File operation complete" : "Working on files\u2026";
    }
  }

  if (toolName === "file_manager") {
    const command = typeof args.command === "string" ? args.command : null;
    if (!filename) {
      return isComplete ? "File operation complete" : "Working on files\u2026";
    }
    switch (command) {
      case "rename": {
        const newPath = typeof args.new_path === "string" ? args.new_path : null;
        const newFilename = newPath ? newPath.split("/").pop() || newPath : null;
        if (isComplete && newFilename) {
          return `Renamed ${filename} \u2192 ${newFilename}`;
        }
        return `Renaming ${filename}`;
      }
      case "delete":
        return isComplete ? `Deleted ${filename}` : `Deleting ${filename}`;
      default:
        return isComplete ? "File operation complete" : "Working on files\u2026";
    }
  }

  // Unknown tool — show raw name
  return toolName;
}

export function ToolCallDisplay({
  toolName,
  args,
  state,
  result,
  className,
}: ToolCallDisplayProps) {
  const isComplete = state === "result" && result !== undefined;
  const label = getToolLabel(toolName, args, isComplete);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200",
        className
      )}
    >
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
