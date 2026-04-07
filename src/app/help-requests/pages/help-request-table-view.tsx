import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Star,
  Pencil,
  Trash2,
  Eye,
  HandHelping,
  X,
} from "lucide-react";
import type { HelpRequest } from "@/app/help-requests/data";

type HelpRequestTableViewProps = {
  requests: HelpRequest[];
  onSelect: (request: HelpRequest) => void;
  onEdit: (request: HelpRequest) => void;
  onDelete: (request: HelpRequest) => void;
  onClaim: (request: HelpRequest) => void;
  onUnclaim: (request: HelpRequest) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open: "outline",
  claimed: "default",
  completed: "secondary",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function HelpRequestTableView({
  requests,
  onSelect,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
}: HelpRequestTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Task Requester</TableHead>
          <TableHead>Helper</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id} className="group">
            <TableCell className="py-3 max-w-xs">
              <div className="relative overflow-hidden">
                <button
                  type="button"
                  className="font-medium text-foreground text-sm hover:text-primary hover:underline underline-offset-2 transition-colors w-full text-left line-clamp-2"
                  onClick={() => onSelect(request)}
                >
                  {request.description}
                </button>

                {/* Smooth fade + blur */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20">
                  <div className="h-full w-full bg-gradient-to-l from-background via-background/70 to-transparent backdrop-blur-[2px]" />
                </div>
              </div>
            </TableCell>
            <TableCell className="py-3">
              <div className="flex items-center gap-2">
                <Avatar className="size-7 border-2 border-card">
                  <AvatarImage
                    src={request.requester.avatarUrl}
                    alt={request.requester.name}
                  />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(request.requester.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{request.requester.name}</span>
              </div>
            </TableCell>
            <TableCell className="py-3">
              {request.helper ? (
                <div className="flex items-center gap-2">
                  <Avatar className="size-7 border-2 border-card">
                    <AvatarImage
                      src={request.helper.avatarUrl}
                      alt={request.helper.name}
                    />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(request.helper.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{request.helper.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </TableCell>
            <TableCell className="py-3">
              <Badge variant={statusVariant[request.status] ?? "outline"}>
                {statusLabel[request.status] ?? request.status}
              </Badge>
            </TableCell>
            <TableCell className="py-3">
              {request.rating > 0 ? (
                <StarRating rating={request.rating} />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground py-3 text-sm font-mono">
              {request.createdAt}
            </TableCell>
            <TableCell className="text-right py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelect(request)}>
                    <Eye className="size-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(request)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  {!request.helper ? (
                    <DropdownMenuItem onClick={() => onClaim(request)}>
                      <HandHelping className="size-4" />
                      Claim
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onUnclaim(request)}>
                      <X className="size-4" />
                      Unclaim
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(request)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
