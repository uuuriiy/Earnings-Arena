"use client";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function SignOutConfirm({
  open,
  address,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  address: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent showCloseButton={false} className="gap-5">
        <DialogHeader>
          <DialogTitle>SIGN OUT?</DialogTitle>
          <DialogDescription>
            Disconnect{" "}
            <span className="text-foreground">{address ?? "this wallet"}</span> from
            Earnings Arena.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Stay connected
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={onConfirm}
          >
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
