
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-white border-4 border-destructive shadow-[var(--neo-shadow)] z-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-bold pt-4">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="!justify-end gap-4 mt-4">
          <AlertDialogCancel 
            onClick={onCancel}
            className="neo-button bg-secondary text-foreground font-black uppercase hover:transform-none hover:shadow-[3px_3px_0px_var(--border)]"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="neo-button bg-destructive text-destructive-foreground font-black uppercase hover:transform-none hover:shadow-[3px_3px_0px_var(--border)]"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
