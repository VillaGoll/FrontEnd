import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import userService from '../../services/user.service';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl, Card, CardContent } from '@mui/material';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: User | null;
    onSuccess: () => void;
}

const UserForm = ({ user, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('regular');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
        } else {
            setName('');
            setEmail('');
            setPassword('');
            setRole('regular');
        }
    }, [user]);

        const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData = { name, email, password, role };
        setLoading(true);
        if (user) {
            userService.updateUser(user._id, { name, email, role })
                .then(() => {
                    toast.success('Usuario actualizado con éxito');
                    onSuccess();
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al actualizar el usuario');
                })
                .finally(() => setLoading(false));
        } else {
            userService.createUser(userData)
                .then(() => {
                    toast.success('Usuario creado con éxito');
                    onSuccess();
                    setName('');
                    setEmail('');
                    setPassword('');
                    setRole('regular');
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al crear el usuario');
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    {user ? 'Edit User' : 'Create User'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    {!user && (
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            autoComplete="new-password"
                        />
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <MenuItem value="regular">Regular</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
                        {user ? 'Update' : 'Create'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default UserForm;