import { useState } from 'react';
import { ExternalLink, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyDialogProps {
  open: boolean;
  onSave: (key: string) => void;
  onClose?: () => void;
  initialKey?: string;
}

export function ApiKeyDialog({ open, onSave, onClose, initialKey = '' }: ApiKeyDialogProps) {
  const [value, setValue] = useState(initialKey);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose?.();
      }}
    >
      <DialogContent hideClose={!onClose} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Conectá tu cuenta de fal.ai
          </DialogTitle>
          <DialogDescription>
            Pegá tu API key de fal.ai. Se guarda solo en tu navegador (localStorage) y nunca sale
            de tu equipo. Vas a pagar por uso real en tu cuenta de fal (~$0.04 por imagen).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="api-key">API key</Label>
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder="fal_..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onSave(value.trim());
            }}
          />
          <a
            href="https://fal.ai/dashboard/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Obtené una clave en fal.ai/dashboard/keys <ExternalLink className="size-3" />
          </a>
        </div>

        <DialogFooter>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button disabled={!value.trim()} onClick={() => onSave(value.trim())}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
