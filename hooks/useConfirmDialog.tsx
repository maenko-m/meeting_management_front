import React, { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions = {}) => {
    setOptions(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleClose = (confirmed: boolean) => {
    setOpen(false);
    if (resolveFn) {
      resolveFn(confirmed);
      setResolveFn(null);
    }
  };

  const ConfirmComponent = () => (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      title={options.title || 'Подтверждение'}
      message={options.message || 'Вы уверены?'}
      confirmText={options.confirmText || 'Да'}
      cancelText={options.cancelText || 'Нет'}
    />
  );

  return { confirm, ConfirmComponent };
};