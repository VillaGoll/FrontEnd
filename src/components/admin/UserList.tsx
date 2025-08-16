import { useEffect, useState } from 'react';
import userService from '../../services/user.service';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Props {
    onEdit: (user: User) => void;
    refresh: boolean;
}

const UserList = ({ onEdit, refresh }: Props) => {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        userService.getAllUsers().then(response => {
            setUsers(response.data);
        });
    }, [refresh]);

    const handleClickOpen = (id: string) => {
        setSelectedUserId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUserId(null);
    };

    const handleDelete = () => {
        if (selectedUserId) {
            userService.deleteUser(selectedUserId).then(() => {
                setUsers(users.filter(user => user._id !== selectedUserId));
                handleClose();
            });
        }
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Users
                </Typography>
                <List>
                    {users.map(user => (
                        <ListItem key={user._id}>
                            <ListItemText primary={user.name} secondary={user.email} />
                            <IconButton onClick={() => onEdit(user)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleClickOpen(user._id)}>
                                <Delete />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleDelete} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default UserList;