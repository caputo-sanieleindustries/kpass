import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog';
import { Button } from './ui/button';

export default function RecoveryKeyDialog({ recoveryKey, username, onConfirm }) {
  const downloadRecoveryKey = () => {
    const content = `SafePass Recovery Key\n\nUsername: ${username}\nRecovery Key: ${recoveryKey}\n\n⚠️ IMPORTANTE: Salva questa chiave in un posto sicuro!\nAvrai bisogno di questa chiave per recuperare il tuo account se dimentichi la master password.\n\nNon condividere mai questa chiave con nessuno.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safepass-recovery-${username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      alert('Chiave copiata negli appunti!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-[500px]" data-testid="recovery-key-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="dialog-title">⚠️ Salva la tua Chiave di Recupero</AlertDialogTitle>
          <AlertDialogDescription data-testid="dialog-description">
            Questa è la tua chiave di recupero unica. Ti servirà per recuperare l'accesso al tuo account se dimentichi la master password.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="recovery-key-box" data-testid="recovery-key-display">
          <div className="recovery-key-label">La tua chiave di recupero:</div>
          <div className="recovery-key-value">{recoveryKey}</div>
          <button 
            className="btn-icon-text" 
            onClick={copyToClipboard}
            data-testid="copy-recovery-key-button"
          >
            📋 Copia
          </button>
        </div>

        <div className="warning-box">
          <strong>⚠️ IMPORTANTE:</strong>
          <ul>
            <li>Salva questa chiave in un posto sicuro</li>
            <li>Non potrai visualizzarla di nuovo</li>
            <li>Senza questa chiave, non potrai recuperare il tuo account</li>
            <li>Non condividerla con nessuno</li>
          </ul>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={downloadRecoveryKey}
            data-testid="download-recovery-key-button"
          >
            💾 Scarica come File
          </Button>
          <Button 
            onClick={onConfirm}
            data-testid="confirm-saved-button"
          >
            Ho salvato la chiave, continua
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}