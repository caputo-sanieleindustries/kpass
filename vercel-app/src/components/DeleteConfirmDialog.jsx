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
} from './ui/alert-dialog';

export default function DeleteConfirmDialog({ passwordTitle, onClose, onConfirm }) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="dialog-title">Sei sicuro?</AlertDialogTitle>
          <AlertDialogDescription data-testid="dialog-description">
            Stai per eliminare la password per <strong>{passwordTitle}</strong>. 
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} data-testid="cancel-button">
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} data-testid="confirm-button">
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}