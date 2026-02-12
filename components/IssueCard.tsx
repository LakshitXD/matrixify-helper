"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ValidationIssue } from "@/types/validation";
import { cn } from "@/lib/utils";

type IssueCardProps = {
  issue: ValidationIssue;
  className?: string;
  /** Called when user clicks to scroll to affected rows in the table */
  onGoToRows?: (rowNumbers: number[]) => void;
  /** Called when user clicks Apply fix (only when issue has fix) */
  onApplyFix?: (issue: ValidationIssue) => void;
};

export function IssueCard({
  issue,
  className,
  onGoToRows,
  onApplyFix,
}: IssueCardProps) {
  const isError = issue.type === "error";
  const hasRows = issue.rows && issue.rows.length > 0;
  const isClickable = !!onGoToRows;
  const hasFix = !!issue.fix && !!onApplyFix;

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasFix && (e.target as HTMLElement).closest("[data-apply-fix]"))
      return;
    if (onGoToRows) onGoToRows(issue.rows ?? []);
  };

  return (
    <Card
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleCardClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (hasFix && (e.target as HTMLElement).closest("[data-apply-fix]"))
                  return;
                if (onGoToRows) onGoToRows(issue.rows ?? []);
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border-l-4 text-left",
        isError
          ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
          : "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
        isClickable &&
          "cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-opacity",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{issue.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {issue.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {hasRows && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Rows: </span>
            {issue.rows!.slice(0, 20).join(", ")}
            {issue.rows!.length > 20 && ` (+${issue.rows!.length - 20} more)`}
          </p>
        )}
        {issue.suggestion && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Suggestion: </span>
            {issue.suggestion}
          </p>
        )}
        {hasFix && (
          <div data-apply-fix className="pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onApplyFix?.(issue);
              }}
            >
              Apply fix
            </Button>
          </div>
        )}
        {isClickable && (
          <p className="text-sm text-primary font-medium pt-1">
            {hasRows ? "Click to show in table" : "Click to show table"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
