import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography, Card, CardContent } from '@mui/material';
import clientService from '../../services/client.service';

interface Client {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface ClientFormProps {
    client: Client | null;
    onSuccess: () => void;
}

const ClientForm = ({ client, onSuccess }: ClientFormProps) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (client) {
            setName(client.name);
            setEmail(client.email);
            setPhone(client.phone);
        } else {
            setName('');
            setEmail('');
            setPhone('');
        }
    }, [client]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clientData = { name, email, phone };
        setLoading(true);
        if (client) {
            clientService.updateClient(client._id, clientData)
                .then(() => {
                    toast.success('Cliente actualizado con éxito');
                    onSuccess();
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al actualizar el cliente');
                })
                .finally(() => setLoading(false));
        } else {
            clientService.createClient(clientData)
                .then(() => {
                    toast.success('Cliente creado con éxito');
                    onSuccess();
                    setName('');
                    setEmail('');
                    setPhone('');
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al crear el cliente');
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    <TextField
                        label="Teléfono"
                        type="number"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        onWheel={(e) => e.currentTarget.blur()}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
                        Guardar
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ClientForm;