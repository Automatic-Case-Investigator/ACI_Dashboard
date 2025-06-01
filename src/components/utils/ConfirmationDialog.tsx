import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { CallbackFunction } from '../../types/types';

interface ConfirmationDialogProps {
    onCancel: CallbackFunction,
    onContinue: CallbackFunction
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({onCancel, onContinue}) => {
    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Confirmation
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to continue?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={onCancel}>Cancel</Button>
                <Button color="info" onClick={onContinue} autoFocus>
                    Continue
                </Button>
            </DialogActions>
        </>
    )
}