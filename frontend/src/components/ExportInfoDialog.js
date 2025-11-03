import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog';
import { Button } from './ui/button';

export default function ExportInfoDialog({ onClose, onConfirm }) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px]" data-testid="export-info-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="dialog-title">
            📤 Come Funziona l'Export delle Password
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="dialog-description">
            Segui questi passaggi per esportare e decrittare le tue password in sicurezza
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div style={{ padding: '1rem 0' }}>
          <div style={{ 
            background: '#fffbeb', 
            border: '1px solid #fde68a', 
            borderRadius: '8px', 
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <strong style={{ color: '#92400e' }}>⚠️ IMPORTANTE:</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#92400e' }}>
              Le password esportate sono criptate per la tua sicurezza. Avrai bisogno della tua master password per decriptarle.
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            fontSize: '0.95rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ 
                background: '#0a0a0a', 
                color: 'white', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '600',
                flexShrink: 0
              }}>1</div>
              <div>
                <strong>Esporta le Password</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>
                  Seleziona il formato (CSV, XML, XLSX) e scarica il file
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ 
                background: '#0a0a0a', 
                color: 'white', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '600',
                flexShrink: 0
              }}>2</div>
              <div>
                <strong>Apri il Tool di Decrittazione</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>
                  Usa il pulsante "🔓 Decripta Password" nella dashboard o clicca il pulsante qui sotto
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ 
                background: '#0a0a0a', 
                color: 'white', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '600',
                flexShrink: 0
              }}>3</div>
              <div>
                <strong>Inserisci i Dati</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>
                  Master password, username e password criptata dal file esportato
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ 
                background: '#0a0a0a', 
                color: 'white', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '600',
                flexShrink: 0
              }}>4</div>
              <div>
                <strong>Decripta!</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>
                  Il tool mostrerà le password in chiaro. Funziona completamente offline!
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            onClick={() => window.open('/decrypt.html', '_blank')}
            data-testid="open-decrypt-button"
            style={{ width: '100%' }}
          >
            🔓 Apri Tool di Decrittazione
          </Button>
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="cancel-button"
              style={{ flex: 1 }}
            >
              Annulla
            </Button>
            <Button 
              onClick={onConfirm}
              data-testid="continue-export-button"
              style={{ flex: 1 }}
            >
              Continua con Export
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
