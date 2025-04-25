import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function AlertDialog({
  open,
  text = "Are you sure ?",
  title = "Confirmation",
  option1Text = "Cancel",
  option2Text = "Confirm",
  onClose,
  onOption1,
  onOption2,
}) {
  const handleOption1 = () => {
    onOption1?.();  
    onClose?.();    
  };

  const handleOption2 = () => {
    onOption2?.();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOption1}>{option1Text}</Button>
        <Button onClick={handleOption2} autoFocus>
          {option2Text}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
