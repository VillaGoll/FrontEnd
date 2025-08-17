import { Container, Typography, Box } from '@mui/material';
import CourtList from '../components/admin/CourtList';
import CourtForm from '../components/admin/CourtForm';
import UserList from '../components/admin/UserList';
import UserForm from '../components/admin/UserForm';
import ClientList from '../components/admin/ClientList';
import ClientForm from '../components/admin/ClientForm';
import { useState } from 'react';
import { Tab, Tabs, Fade } from '@mui/material';

interface Court {
    _id: string;
    name: string;
    color: string;
}

const AdminPage = () => {
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [tab, setTab] = useState(0);

    const handleEditCourt = (court: Court) => {
        setSelectedCourt(court);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
    };

    const handleEditClient = (client: any) => {
        setSelectedClient(client);
    };

    const handleSuccess = () => {
        setSelectedCourt(null);
        setSelectedUser(null);
        setSelectedClient(null);
        setRefresh(prev => !prev);
    };

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Panel
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={handleChangeTab} aria-label="admin tabs">
                    <Tab label="Canchas" />
                    <Tab label="Usuarios" />
                    <Tab label="Clientes" />
                </Tabs>
            </Box>

            <Fade in={tab === 0}>
                <Box sx={{ display: tab === 0 ? 'flex' : 'none', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <CourtList onEdit={handleEditCourt} refresh={refresh} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <CourtForm court={selectedCourt} onSuccess={handleSuccess} />
                    </Box>
                </Box>
            </Fade>

            <Fade in={tab === 1}>
                <Box sx={{ display: tab === 1 ? 'flex' : 'none', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <UserList onEdit={handleEditUser} refresh={refresh} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <UserForm user={selectedUser} onSuccess={handleSuccess} />
                    </Box>
                </Box>
            </Fade>

            <Fade in={tab === 2}>
                <Box sx={{ display: tab === 2 ? 'flex' : 'none', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <ClientList onEdit={handleEditClient} refresh={refresh} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <ClientForm client={selectedClient} onSuccess={handleSuccess} />
                    </Box>
                </Box>
            </Fade>
        </Container>
    );
};

export default AdminPage;